export default function FeatureCard({ title, description }: { title: string; description: string }) {
    return (
      <div className="bg-white p-6 shadow-md rounded-lg hover:shadow-lg transition duration-300">
        <h2 className="text-xl font-semibold mb-2">{title}</h2>
        <p className="text-gray-500">{description}</p>
      </div>
    )
  }
  