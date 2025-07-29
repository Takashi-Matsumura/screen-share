import { NextRequest, NextResponse } from 'next/server';

// グローバル変数にアクセス
declare global {
  var currentAccessCode: string | null | undefined;
  var accessCodeExpiry: number | null | undefined;
}

// POSTリクエスト：アクセスコードを検証
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code } = body;

    if (!code) {
      return NextResponse.json({ 
        valid: false, 
        error: 'アクセスコードが入力されていません' 
      }, { status: 400 });
    }

    // コードの形式チェック（6桁の数字）
    if (!/^\d{6}$/.test(code)) {
      return NextResponse.json({ 
        valid: false, 
        error: 'アクセスコードは6桁の数字で入力してください' 
      }, { status: 400 });
    }

    const currentTime = Date.now();
    
    // 有効なコードが存在するかチェック
    if (!globalThis.currentAccessCode) {
      return NextResponse.json({ 
        valid: false, 
        error: '現在有効なアクセスコードがありません。講師にコードの生成を依頼してください。' 
      }, { status: 403 });
    }

    // コードの有効期限をチェック
    if (globalThis.accessCodeExpiry && currentTime > globalThis.accessCodeExpiry) {
      // 期限切れのコードを削除
      globalThis.currentAccessCode = null;
      globalThis.accessCodeExpiry = null;
      
      return NextResponse.json({ 
        valid: false, 
        error: 'アクセスコードの有効期限が切れています。講師に新しいコードの生成を依頼してください。' 
      }, { status: 403 });
    }

    // コードの照合
    if (code === globalThis.currentAccessCode) {
      console.log(`アクセスコード認証成功: ${code}`);
      return NextResponse.json({ 
        valid: true, 
        message: 'アクセスコードが正しく認証されました' 
      });
    } else {
      console.log(`アクセスコード認証失敗: 入力=${code}, 正解=${globalThis.currentAccessCode}`);
      return NextResponse.json({ 
        valid: false, 
        error: 'アクセスコードが正しくありません' 
      }, { status: 403 });
    }

  } catch (error) {
    console.error('アクセスコードの検証中にエラーが発生:', error);
    return NextResponse.json({ 
      valid: false, 
      error: 'サーバーエラーが発生しました' 
    }, { status: 500 });
  }
}