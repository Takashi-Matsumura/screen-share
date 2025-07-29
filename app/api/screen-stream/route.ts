import { NextRequest, NextResponse } from 'next/server';

// SSEメッセージの型定義
interface SSEMessage {
  type: string;
  data?: string;
  clientId?: string;
  message?: string;
  timestamp: number;
}

// グローバル変数を使用してクライアント管理（Vercel環境での制限対応）
declare global {
  var connectedClientsGlobal: Map<string, ReadableStreamDefaultController<Uint8Array>> | undefined;
  var latestImageGlobal: string | null | undefined;
}

// 接続中のクライアントを管理するMap
if (!globalThis.connectedClientsGlobal) {
  globalThis.connectedClientsGlobal = new Map();
}

// 最新の画像データを保存
if (globalThis.latestImageGlobal === undefined) {
  globalThis.latestImageGlobal = null;
}

const connectedClients = globalThis.connectedClientsGlobal;
let latestImage = globalThis.latestImageGlobal;

// クライアントに送信するメッセージを作成
function createSSEMessage(data: SSEMessage): string {
  return `data: ${JSON.stringify(data)}\n\n`;
}

// POSTリクエスト：講師からの画像データを受信
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { image } = body;

    if (!image) {
      return NextResponse.json({ error: '画像データが見つかりません' }, { status: 400 });
    }

    // 最新の画像データを更新
    latestImage = image;
    globalThis.latestImageGlobal = image;

    // 接続中の全ての学生クライアントに画像を送信
    const message = createSSEMessage({
      type: 'image',
      data: image,
      timestamp: Date.now()
    });

    // 各クライアントにメッセージを送信
    connectedClients.forEach((controller, clientId) => {
      try {
        const encoder = new TextEncoder();
        controller.enqueue(encoder.encode(message));
      } catch (error) {
        console.error(`クライアント ${clientId} への送信に失敗:`, error);
        // 失敗したクライアントを削除
        connectedClients.delete(clientId);
      }
    });

    return NextResponse.json({ 
      success: true, 
      connectedClients: connectedClients.size 
    });

  } catch (error) {
    console.error('画像データの処理中にエラーが発生:', error);
    return NextResponse.json({ error: 'サーバーエラー' }, { status: 500 });
  }
}

// GETリクエスト：SSEストリームを開始
export async function GET(request: NextRequest) {
  // アクセスコードの確認（現在は記録のみ）
  const url = new URL(request.url);
  const accessCode = url.searchParams.get('accessCode');
  
  // アクセスコードをログに記録（将来の拡張用）
  if (accessCode) {
    console.log(`アクセスコード付きで接続: ${accessCode}`);
  }
  
  // クライアントIDを生成
  const clientId = `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  console.log(`新しいクライアントが接続しました: ${clientId}`);

  let heartbeatInterval: NodeJS.Timeout;

  // ReadableStreamを作成してSSEを実装
  const stream = new ReadableStream({
    start(controller) {
      // クライアントを接続リストに追加
      connectedClients.set(clientId, controller);

      // 接続確立メッセージを送信
      const encoder = new TextEncoder();
      const connectMessage = createSSEMessage({
        type: 'connected',
        clientId,
        message: '接続が確立されました',
        timestamp: Date.now()
      });
      controller.enqueue(encoder.encode(connectMessage));

      // 最新の画像がある場合は即座に送信
      if (latestImage) {
        const imageMessage = createSSEMessage({
          type: 'image',
          data: latestImage,
          timestamp: Date.now()
        });
        controller.enqueue(encoder.encode(imageMessage));
      }

      // 定期的にハートビートを送信（接続維持のため）
      heartbeatInterval = setInterval(() => {
        try {
          const heartbeat = createSSEMessage({
            type: 'heartbeat',
            timestamp: Date.now()
          });
          controller.enqueue(encoder.encode(heartbeat));
        } catch (error) {
          console.error(`クライアント ${clientId} のハートビート送信に失敗:`, error);
          clearInterval(heartbeatInterval);
          connectedClients.delete(clientId);
        }
      }, 30000); // 30秒間隔

    },

    cancel() {
      console.log(`ストリームがキャンセルされました: ${clientId}`);
      clearInterval(heartbeatInterval);
      connectedClients.delete(clientId);
    }
  });

  // SSE用のヘッダーを設定
  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}