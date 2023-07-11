import MessagesContainer from "./MessagesContainer";

export default function DirectMessaging() {
  return (
    <div className="max-w-[130ch] mx-auto px-16">
      <div className="flex flex-wrap gap-16 justify-between items-center mb-16">
        <h1 className="text-h1 font-bolder text-violet-500">
          Chat with AI & pay with Lightning
        </h1>
      </div>
      <div className="h-[min(70vh,800px)] bg-gray-400 bg-opacity-30 rounded p-16 flex flex-col ">
        <MessagesContainer />
      </div>
    </div>
  );
}
