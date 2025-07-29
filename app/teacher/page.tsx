'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { 
  FaPlay, 
  FaStop, 
  FaUsers, 
  FaBroadcastTower,
  FaDesktop,
  FaCheckCircle,
  FaKey,
  FaSync,
  FaCopy,
  FaTrash
} from 'react-icons/fa';

export default function TeacherPage() {
  const [isCapturing, setIsCapturing] = useState(false);
  const [connectedStudents, setConnectedStudents] = useState(0);
  const [error, setError] = useState('');
  const [accessCode, setAccessCode] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);
  const streamRef = useRef<MediaStream | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const captureAndSend = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    if (!ctx) return;

    // キャンバスサイズを設定（圧縮のため解像度を下げる）
    canvas.width = 1280;
    canvas.height = 720;

    // ビデオフレームをキャンバスに描画
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // 画像をJPEG形式でエンコード（品質を調整して容量を削減）
    const imageData = canvas.toDataURL('image/jpeg', 0.7);

    try {
      // サーバーに画像データを送信
      await fetch('/api/screen-stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ image: imageData }),
      });
    } catch (err) {
      console.error('画像の送信に失敗しました:', err);
    }
  }, []);

  const stopCapture = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setIsCapturing(false);
  }, []);

  const startCapture = useCallback(async () => {
    try {
      setError('');
      
      // Screen Capture APIを使用してデスクトップをキャプチャ
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        },
        audio: false
      });

      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      setIsCapturing(true);

      // 1秒間隔で画面をキャプチャして送信
      intervalRef.current = setInterval(() => {
        captureAndSend();
      }, 1000);

      // ストリームが終了した時の処理
      stream.getVideoTracks()[0].addEventListener('ended', stopCapture);

    } catch (err) {
      console.error('画面キャプチャの開始に失敗しました:', err);
      setError('画面キャプチャの開始に失敗しました。ブラウザが画面共有をサポートしているか確認してください。');
    }
  }, [captureAndSend, stopCapture]);

  // 接続中の学生数を取得
  const fetchConnectedStudents = useCallback(async () => {
    try {
      const response = await fetch('/api/connected-count');
      const data = await response.json();
      setConnectedStudents(data.count || 0);
    } catch (err) {
      console.error('接続数の取得に失敗しました:', err);
    }
  }, []);

  // アクセスコードを生成
  const generateAccessCode = useCallback(async () => {
    try {
      const response = await fetch('/api/access-code', {
        method: 'POST',
      });
      const data = await response.json();
      
      if (data.success) {
        setAccessCode(data.code);
        setError('');
      } else {
        setError('アクセスコードの生成に失敗しました');
      }
    } catch (err) {
      console.error('アクセスコードの生成に失敗しました:', err);
      setError('アクセスコードの生成に失敗しました');
    }
  }, []);

  // アクセスコードを無効化
  const disableAccessCode = useCallback(async () => {
    try {
      await fetch('/api/access-code', {
        method: 'DELETE',
      });
      setAccessCode(null);
    } catch (err) {
      console.error('アクセスコードの無効化に失敗しました:', err);
    }
  }, []);

  // アクセスコードをクリップボードにコピー
  const copyToClipboard = useCallback(async () => {
    if (!accessCode) return;
    
    try {
      await navigator.clipboard.writeText(accessCode);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('クリップボードへのコピーに失敗しました:', err);
    }
  }, [accessCode]);

  // 現在のアクセスコードを取得
  const fetchAccessCode = useCallback(async () => {
    try {
      const response = await fetch('/api/access-code');
      const data = await response.json();
      
      if (data.isActive) {
        setAccessCode(data.code);
      } else {
        setAccessCode(null);
      }
    } catch (err) {
      console.error('アクセスコードの取得に失敗しました:', err);
    }
  }, []);

  // 定期的に接続数とアクセスコードを更新
  useEffect(() => {
    fetchConnectedStudents();
    fetchAccessCode();
    const interval = setInterval(() => {
      fetchConnectedStudents();
      fetchAccessCode();
    }, 5000);
    return () => clearInterval(interval);
  }, [fetchConnectedStudents, fetchAccessCode]);

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-6 border border-slate-200">
          <h1 className="text-3xl font-bold text-slate-800 mb-8 text-center">
            講師用画面共有システム
          </h1>

          {/* エラー表示 */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          {/* ステータス表示 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
              <div className="flex items-center mb-2">
                <FaBroadcastTower className="text-slate-600 mr-2" />
                <h3 className="font-semibold text-slate-800">配信状態</h3>
              </div>
              <div className="flex items-center">
                <div className={`w-3 h-3 rounded-full mr-2 ${
                  isCapturing ? 'bg-emerald-500' : 'bg-slate-400'
                }`}></div>
                <span className={isCapturing ? 'text-emerald-700' : 'text-slate-600'}>
                  {isCapturing ? '配信中' : '停止中'}
                </span>
              </div>
            </div>

            <div className="bg-stone-50 p-4 rounded-lg border border-stone-200">
              <div className="flex items-center mb-2">
                <FaUsers className="text-stone-600 mr-2" />
                <h3 className="font-semibold text-slate-800">接続中の学生</h3>
              </div>
              <div className="text-2xl font-bold text-stone-700">
                {connectedStudents}人
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <div className="flex items-center mb-2">
                <FaKey className="text-blue-600 mr-2" />
                <h3 className="font-semibold text-slate-800">アクセスコード</h3>
              </div>
              {accessCode ? (
                <div className="space-y-2">
                  <div className="text-2xl font-bold text-blue-700 font-mono">
                    {accessCode}
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={copyToClipboard}
                      className="flex items-center px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                    >
                      <FaCopy className="mr-1" />
                      {copySuccess ? 'コピー済み' : 'コピー'}
                    </button>
                    <button
                      onClick={disableAccessCode}
                      className="flex items-center px-2 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                    >
                      <FaTrash className="mr-1" />
                      無効化
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={generateAccessCode}
                  className="flex items-center px-3 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                >
                  <FaSync className="mr-2" />
                  コード生成
                </button>
              )}
            </div>
          </div>

          {/* コントロールボタン */}
          <div className="flex justify-center space-x-4 mb-8">
            {!isCapturing ? (
              <button
                onClick={startCapture}
                className="bg-slate-700 hover:bg-slate-800 text-white font-bold py-3 px-6 rounded-lg transition-colors flex items-center"
              >
                <FaPlay className="mr-2" />
                画面共有を開始
              </button>
            ) : (
              <button
                onClick={stopCapture}
                className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg transition-colors flex items-center"
              >
                <FaStop className="mr-2" />
                画面共有を停止
              </button>
            )}
          </div>

          {/* プレビュー */}
          <div className="mb-4">
            <div className="flex items-center mb-2">
              <FaDesktop className="text-slate-600 mr-2" />
              <h3 className="font-semibold text-slate-800">プレビュー</h3>
            </div>
            <div className="bg-slate-100 rounded-lg p-4 border border-slate-200">
              <video
                ref={videoRef}
                className="w-full max-w-md mx-auto rounded shadow-md"
                muted
                style={{ display: isCapturing ? 'block' : 'none' }}
              />
              {!isCapturing && (
                <div className="text-center text-slate-500 py-8">
                  画面共有を開始するとプレビューが表示されます
                </div>
              )}
            </div>
          </div>

          {/* 非表示のキャンバス（画像処理用） */}
          <canvas ref={canvasRef} style={{ display: 'none' }} />

          {/* 使用方法 */}
          <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
            <h3 className="font-semibold text-slate-800 mb-2">使用方法</h3>
            <ol className="list-decimal list-inside text-slate-700 space-y-2">
              <li className="flex items-start">
                <span className="mr-2">1.</span>
                <div className="flex items-center">
                  <FaCheckCircle className="text-slate-500 mr-2 mt-0.5 flex-shrink-0" />
                  「コード生成」ボタンをクリックしてアクセスコードを作成
                </div>
              </li>
              <li className="flex items-start">
                <span className="mr-2">2.</span>
                <div className="flex items-center">
                  <FaCheckCircle className="text-slate-500 mr-2 mt-0.5 flex-shrink-0" />
                  「画面共有を開始」ボタンをクリック
                </div>
              </li>
              <li className="flex items-start">
                <span className="mr-2">3.</span>
                <div className="flex items-center">
                  <FaCheckCircle className="text-slate-500 mr-2 mt-0.5 flex-shrink-0" />
                  共有する画面（デスクトップ全体、アプリケーション、ブラウザタブ）を選択
                </div>
              </li>
              <li className="flex items-start">
                <span className="mr-2">4.</span>
                <div className="flex items-center">
                  <FaCheckCircle className="text-slate-500 mr-2 mt-0.5 flex-shrink-0" />
                  学生にアクセスコードと視聴用URL（/student）を共有
                </div>
              </li>
              <li className="flex items-start">
                <span className="mr-2">5.</span>
                <div className="flex items-center">
                  <FaCheckCircle className="text-slate-500 mr-2 mt-0.5 flex-shrink-0" />
                  配信を終了する際は「画面共有を停止」ボタンをクリック
                </div>
              </li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}