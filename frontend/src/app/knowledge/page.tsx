export default function KnowledgeOverviewPage() {
  return (
    <div className="h-full bg-gray-100 p-6">
      <div className="grid grid-cols-2 gap-8 items-center bg-white rounded-lg shadow p-6">
        {/* 左边文字介绍 */}
        <div>
          <h1 className="text-3xl font-bold mb-4">Knowledge Overview</h1>
          <p className="text-lg text-gray-700 mb-4">
            Here you can explore how <span className="font-semibold">structured data shapes</span> and how the <span className="font-semibold">recommendation system</span> works.
          </p>
          <p className="text-xl text-gray-700 mb-4">
            <span className="font-semibold">Overview</span>.
          </p>
          <p className="text-xl text-gray-700 mb-4">
            <span className="font-semibold">Knowledge Graphs</span>.
          </p>
          <p className="text-xl text-gray-700 mb-4">
            <span className="font-semibold">Rcommendation System</span>.
          </p>
                                        
        </div>

        {/* 右边图片 */}
        <div className="flex justify-center">
          <img
            src="C:\Users\susik\GraphAIFlow\frontend\1.png" 
            alt="Knowledge Flow Diagram"
            className="rounded-lg shadow-lg w-3/4"
          />
        </div>
      </div>
    </div>
  
  );
}
