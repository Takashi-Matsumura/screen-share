import { NextResponse } from 'next/server';

// アクセスコードをグローバルに管理
declare global {
  var currentAccessCode: string | null | undefined;
  var accessCodeExpiry: number | null | undefined;
}

if (globalThis.currentAccessCode === undefined) {
  globalThis.currentAccessCode = null;
}

if (globalThis.accessCodeExpiry === undefined) {
  globalThis.accessCodeExpiry = null;
}

// 6桁のランダムな数字コードを生成
function generateAccessCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// POSTリクエスト：新しいアクセスコードを生成
export async function POST() {
  try {
    const newCode = generateAccessCode();
    const expiry = Date.now() + (24 * 60 * 60 * 1000); // 24時間有効
    
    globalThis.currentAccessCode = newCode;
    globalThis.accessCodeExpiry = expiry;
    
    console.log(`新しいアクセスコードが生成されました: ${newCode}`);
    
    return NextResponse.json({
      success: true,
      code: newCode,
      expiry
    });
  } catch (error) {
    console.error('アクセスコードの生成に失敗:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'コードの生成に失敗しました' 
    }, { status: 500 });
  }
}

// GETリクエスト：現在のアクセスコードを取得
export async function GET() {
  try {
    const currentTime = Date.now();
    
    // コードの有効期限をチェック
    if (globalThis.accessCodeExpiry && currentTime > globalThis.accessCodeExpiry) {
      globalThis.currentAccessCode = null;
      globalThis.accessCodeExpiry = null;
    }
    
    return NextResponse.json({
      code: globalThis.currentAccessCode,
      expiry: globalThis.accessCodeExpiry,
      isActive: !!globalThis.currentAccessCode
    });
  } catch (error) {
    console.error('アクセスコードの取得に失敗:', error);
    return NextResponse.json({ 
      error: 'コードの取得に失敗しました' 
    }, { status: 500 });
  }
}

// DELETEリクエスト：アクセスコードを無効化
export async function DELETE() {
  try {
    globalThis.currentAccessCode = null;
    globalThis.accessCodeExpiry = null;
    
    console.log('アクセスコードが無効化されました');
    
    return NextResponse.json({
      success: true,
      message: 'アクセスコードが無効化されました'
    });
  } catch (error) {
    console.error('アクセスコードの無効化に失敗:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'コードの無効化に失敗しました' 
    }, { status: 500 });
  }
}