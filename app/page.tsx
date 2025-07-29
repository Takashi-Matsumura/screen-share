import Link from "next/link";
import { 
  FaChalkboardTeacher, 
  FaUserGraduate, 
  FaDesktop, 
  FaBroadcastTower, 
  FaUsers, 
  FaExpand, 
  FaSync,
  FaPlay,
  FaShareAlt,
  FaKey
} from "react-icons/fa";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-stone-100">
      <div className="max-w-4xl mx-auto px-4 py-16">
        {/* ヘッダー */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-slate-800 mb-4">
            画面共有システム
          </h1>
          <p className="text-xl text-slate-600 mb-2">
            講師の画面をリアルタイムで学生に共有
          </p>
          <p className="text-sm text-slate-500">
            教室での授業やオンライン講座に最適な画面共有ソリューション
          </p>
        </div>

        {/* 主要機能 */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          {/* 講師用カード */}
          <div className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-shadow border border-slate-200">
            <div className="text-center mb-6">
              <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaChalkboardTeacher className="text-3xl text-slate-600" />
              </div>
              <h2 className="text-2xl font-bold text-slate-800 mb-2">講師用</h2>
              <p className="text-slate-600">
                デスクトップを学生に共有します
              </p>
            </div>
            
            <div className="space-y-3 mb-8">
              <div className="flex items-center text-sm text-slate-600">
                <FaDesktop className="w-4 h-4 text-slate-500 mr-3" />
                画面キャプチャ機能
              </div>
              <div className="flex items-center text-sm text-slate-600">
                <FaBroadcastTower className="w-4 h-4 text-slate-500 mr-3" />
                リアルタイム配信
              </div>
              <div className="flex items-center text-sm text-slate-600">
                <FaUsers className="w-4 h-4 text-slate-500 mr-3" />
                接続数表示
              </div>
            </div>

            <Link 
              href="/teacher"
              className="block w-full bg-slate-700 hover:bg-slate-800 text-white font-semibold py-3 px-6 rounded-lg text-center transition-colors"
            >
              講師用ページへ
            </Link>
          </div>

          {/* 学生用カード */}
          <div className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-shadow border border-slate-200">
            <div className="text-center mb-6">
              <div className="w-20 h-20 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaUserGraduate className="text-3xl text-stone-600" />
              </div>
              <h2 className="text-2xl font-bold text-slate-800 mb-2">学生用</h2>
              <p className="text-slate-600">
                講師の画面を視聴します
              </p>
            </div>
            
            <div className="space-y-3 mb-8">
              <div className="flex items-center text-sm text-slate-600">
                <FaKey className="w-4 h-4 text-stone-500 mr-3" />
                アクセスコード認証
              </div>
              <div className="flex items-center text-sm text-slate-600">
                <FaExpand className="w-4 h-4 text-stone-500 mr-3" />
                フルスクリーン表示
              </div>
              <div className="flex items-center text-sm text-slate-600">
                <FaSync className="w-4 h-4 text-stone-500 mr-3" />
                自動再接続
              </div>
            </div>

            <Link 
              href="/student"
              className="block w-full bg-stone-700 hover:bg-stone-800 text-white font-semibold py-3 px-6 rounded-lg text-center transition-colors"
            >
              学生用ページへ
            </Link>
          </div>
        </div>

        {/* 使用方法 */}
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-slate-200">
          <h3 className="text-2xl font-bold text-slate-800 mb-6 text-center">
            使用方法
          </h3>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaPlay className="text-slate-600" />
              </div>
              <h4 className="font-semibold text-slate-800 mb-2">コード生成と画面共有開始</h4>
              <p className="text-sm text-slate-600">
                講師がアクセスコードを生成し、画面共有を開始
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaKey className="text-stone-600" />
              </div>
              <h4 className="font-semibold text-slate-800 mb-2">学生がコード入力</h4>
              <p className="text-sm text-slate-600">
                学生が6桁のアクセスコードを入力して認証
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaShareAlt className="text-slate-600" />
              </div>
              <h4 className="font-semibold text-slate-800 mb-2">リアルタイム共有</h4>
              <p className="text-sm text-slate-600">
                講師の画面が自動的に学生のブラウザに表示
              </p>
            </div>
          </div>
        </div>

        {/* システム要件 */}
        <div className="mt-12 bg-slate-50 rounded-lg p-6 border border-slate-200">
          <h4 className="font-semibold text-slate-800 mb-3">システム要件</h4>
          <div className="grid md:grid-cols-2 gap-4 text-sm text-slate-600">
            <div>
              <h5 className="font-medium text-slate-700 mb-1">講師用</h5>
              <ul className="space-y-1">
                <li>• Chrome、Firefox、Edge（最新版）</li>
                <li>• 画面キャプチャ権限が必要</li>
                <li>• インターネット接続</li>
              </ul>
            </div>
            <div>
              <h5 className="font-medium text-slate-700 mb-1">学生用</h5>
              <ul className="space-y-1">
                <li>• 任意のモダンブラウザ</li>
                <li>• JavaScript有効</li>
                <li>• インターネット接続</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
