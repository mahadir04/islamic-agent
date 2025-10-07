import Chat from "./Chat";

export default function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex justify-center items-center p-4">
      <div className="w-full max-w-2xl bg-white shadow-xl rounded-lg overflow-hidden">
        <div className="bg-green-800 text-white p-6">
          <h1 className="text-2xl font-bold text-center">🕌 Islamic AI Chat Agent</h1>
          <p className="text-center text-green-200 mt-2">Ask questions about Islam based on Quran and Hadith</p>
        </div>
        <Chat />
      </div>
    </div>
  );
}