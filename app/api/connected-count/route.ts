import { NextResponse } from 'next/server';

// screen-stream/route.tsと同じクライアント管理Mapを参照
declare global {
  var connectedClientsGlobal: Map<string, ReadableStreamDefaultController<Uint8Array>> | undefined;
}

export async function GET() {
  try {
    // グローバル変数から実際の接続数を取得
    const count = globalThis.connectedClientsGlobal?.size || 0;
    
    return NextResponse.json({
      count,
      timestamp: Date.now()
    });
  } catch (error) {
    console.error('接続数の取得中にエラーが発生:', error);
    return NextResponse.json({ 
      error: 'サーバーエラー',
      count: 0 
    }, { status: 500 });
  }
}