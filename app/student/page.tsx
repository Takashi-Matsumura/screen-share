'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { 
  FaWifi, 
  FaClock, 
  FaSync, 
  FaExpand, 
  FaCompress,
  FaDesktop,
  FaSpinner,
  FaTimes,
  FaKey,
  FaSignInAlt
} from 'react-icons/fa';

export default function StudentPage() {
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [error, setError] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [accessCode, setAccessCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const imageRef = useRef<HTMLImageElement>(null);
  const eventSourceRef = useRef<EventSource | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // アクセスコードを検証
  const verifyAccessCode = useCallback(async () => {
    if (!accessCode.trim()) {
      setError('アクセスコードを入力してください');
      return;
    }

    setIsVerifying(true);
    setError('');

    try {
      const response = await fetch('/api/verify-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code: accessCode.trim() }),
      });

      const data = await response.json();

      if (data.valid) {
        setIsAuthenticated(true);
        setError('');
        // 認証成功後、ストリームに接続
        // connectToStreamは別途呼び出し
      } else {
        setError(data.error || 'アクセスコードが正しくありません');
        setIsAuthenticated(false);
      }
    } catch (err) {
      console.error('アクセスコード検証エラー:', err);
      setError('サーバーとの通信に失敗しました');
      setIsAuthenticated(false);
    } finally {
      setIsVerifying(false);
    }
  }, [accessCode]);

  const connectToStream = useCallback(() => {
    if (!isAuthenticated) return;
    
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    setError('');
    
    // アクセスコードをクエリパラメータとして送信
    const eventSource = new EventSource(`/api/screen-stream?accessCode=${encodeURIComponent(accessCode)}`);
    eventSourceRef.current = eventSource;

    eventSource.onopen = () => {
      console.log('SSE接続が開かれました');
      setIsConnected(true);
      setError('');
    };

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        if (data.type === 'image' && imageRef.current) {
          imageRef.current.src = data.data;
          setLastUpdated(new Date());
        }
      } catch (err) {
        console.error('メッセージの解析に失敗しました:', err);
      }
    };

    eventSource.onerror = (err) => {
      console.error('SSE接続エラー:', err);
      setIsConnected(false);
      setError('サーバーとの接続に問題が発生しました。再接続を試行中...');
      
      // 3秒後に再接続を試行
      setTimeout(() => {
        if (eventSourceRef.current?.readyState === EventSource.CLOSED) {
          connectToStream();
        }
      }, 3000);
    };

    return eventSource;
  }, [isAuthenticated, accessCode]);

  const disconnect = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    setIsConnected(false);
  }, []);

  const toggleFullscreen = useCallback(() => {
    if (!containerRef.current) return;

    if (!isFullscreen) {
      // フルスクリーンモードに入る
      const element = containerRef.current;
      if (element) {
        if (element.requestFullscreen) {
          element.requestFullscreen();
        } else if ('webkitRequestFullscreen' in element) {
          (element as HTMLElement & { webkitRequestFullscreen(): void }).webkitRequestFullscreen();
        } else if ('msRequestFullscreen' in element) {
          (element as HTMLElement & { msRequestFullscreen(): void }).msRequestFullscreen();
        }
      }
    } else {
      // フルスクリーンモードを終了
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if ('webkitExitFullscreen' in document) {
        (document as Document & { webkitExitFullscreen(): void }).webkitExitFullscreen();
      } else if ('msExitFullscreen' in document) {
        (document as Document & { msExitFullscreen(): void }).msExitFullscreen();
      }
    }
  }, [isFullscreen]);

  // フルスクリーン状態の変更を監視
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('msfullscreenchange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('msfullscreenchange', handleFullscreenChange);
    };
  }, []);

  // 認証成功時にストリーム接続を開始
  useEffect(() => {
    if (isAuthenticated) {
      connectToStream();
    }

    return () => {
      disconnect();
    };
  }, [isAuthenticated, connectToStream, disconnect]);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('ja-JP');
  };

  // 認証されていない場合は、コード入力画面を表示
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-800 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaKey className="text-3xl text-blue-600" />
            </div>
            <h1 className="text-2xl font-bold text-slate-800 mb-2">
              アクセスコード入力
            </h1>
            <p className="text-slate-600">
              講師から提供された6桁のアクセスコードを入力してください
            </p>
          </div>

          {/* エラー表示 */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          {/* アクセスコード入力フォーム */}
          <div className="space-y-4">
            <div>
              <label htmlFor="accessCode" className="block text-sm font-medium text-slate-700 mb-2">
                アクセスコード（6桁）
              </label>
              <input
                id="accessCode"
                type="text"
                value={accessCode}
                onChange={(e) => {
                  // 数字のみ許可し、6桁まで制限
                  const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                  setAccessCode(value);
                }}
                placeholder="123456"
                className="w-full px-4 py-3 text-center text-2xl font-mono border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                maxLength={6}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && accessCode.length === 6) {
                    verifyAccessCode();
                  }
                }}
              />
            </div>

            <button
              onClick={verifyAccessCode}
              disabled={accessCode.length !== 6 || isVerifying}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center"
            >
              {isVerifying ? (
                <FaSpinner className="animate-spin mr-2" />
              ) : (
                <FaSignInAlt className="mr-2" />
              )}
              {isVerifying ? '確認中...' : '接続する'}
            </button>
          </div>

          <div className="mt-6 text-center text-sm text-slate-500">
            <p>アクセスコードは講師が生成した6桁の数字です</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className={`min-h-screen ${isFullscreen ? 'bg-slate-900' : 'bg-slate-800'}`}
    >
      {/* ヘッダー（フルスクリーンでない場合のみ表示） */}
      {!isFullscreen && (
        <div className="bg-white shadow-sm border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-semibold text-slate-800">
                講師画面共有 - 学生用
              </h1>
              
              <div className="flex items-center space-x-4">
                {/* 接続状態 */}
                <div className="flex items-center">
                  {isConnected ? (
                    <FaWifi className="text-emerald-500 mr-2" />
                  ) : (
                    <FaTimes className="text-red-500 mr-2" />
                  )}
                  <span className={`text-sm ${
                    isConnected ? 'text-emerald-700' : 'text-red-600'
                  }`}>
                    {isConnected ? '接続中' : '切断中'}
                  </span>
                </div>

                {/* 最終更新時刻 */}
                {lastUpdated && (
                  <div className="flex items-center text-sm text-slate-600">
                    <FaClock className="mr-1" />
                    最終更新: {formatTime(lastUpdated)}
                  </div>
                )}

                {/* コントロールボタン */}
                <div className="flex space-x-2">
                  <button
                    onClick={connectToStream}
                    disabled={isConnected}
                    className="px-3 py-1 text-sm bg-slate-600 text-white rounded hover:bg-slate-700 disabled:bg-slate-400 disabled:cursor-not-allowed flex items-center"
                  >
                    <FaSync className="mr-1" />
                    再接続
                  </button>
                  <button
                    onClick={toggleFullscreen}
                    className="px-3 py-1 text-sm bg-stone-600 text-white rounded hover:bg-stone-700 flex items-center"
                  >
                    <FaExpand className="mr-1" />
                    フルスクリーン
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* エラー表示 */}
      {error && !isFullscreen && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 mx-4 mt-4 rounded">
          {error}
        </div>
      )}

      {/* 画像表示エリア */}
      <div className={`flex items-center justify-center ${
        isFullscreen 
          ? 'h-screen' 
          : error 
            ? 'h-[calc(100vh-140px)]' 
            : 'h-[calc(100vh-80px)]'
      }`}>
        <div className="w-full h-full flex items-center justify-center p-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            ref={imageRef}
            alt="講師の画面"
            className={`max-w-full max-h-full object-contain rounded-lg shadow-lg ${
              isFullscreen ? 'rounded-none shadow-none' : ''
            }`}
            style={{ display: imageRef.current?.src ? 'block' : 'none' }}
          />
          
          {/* 画像が読み込まれていない場合の表示 */}
          {(!imageRef.current?.src || !isConnected) && (
            <div className="text-center">
              <div className="text-6xl mb-4 text-slate-400">
                <FaDesktop />
              </div>
              <h2 className="text-xl font-semibold text-slate-300 mb-2">
                {isConnected ? '画面共有を待機中...' : 'サーバーに接続中...'}
              </h2>
              <p className="text-slate-400">
                {isConnected 
                  ? '講師が画面共有を開始するまでお待ちください'
                  : 'サーバーとの接続を確立しています'
                }
              </p>
              {!isConnected && (
                <div className="mt-4">
                  <FaSpinner className="animate-spin inline-block w-6 h-6 text-slate-500" />
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* フルスクリーン時のコントロール */}
      {isFullscreen && (
        <div className="fixed top-4 right-4 bg-slate-900 bg-opacity-80 rounded-lg p-2 border border-slate-600">
          <button
            onClick={toggleFullscreen}
            className="text-white hover:text-slate-300 text-sm px-3 py-1 rounded flex items-center"
          >
            <FaCompress className="mr-1" />
            フルスクリーン終了
          </button>
        </div>
      )}
    </div>
  );
}