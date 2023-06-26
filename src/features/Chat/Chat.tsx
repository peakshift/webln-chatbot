import ReactModal from "react-modal";
import MessagesContainer from "./MessagesContainer";

export default function DirectMessaging() {
  return (
    <div className="max-w-[130ch] mx-auto px-16">
      <h1 className="text-h1 font-bolder text-violet-500 mb-16">
        Chat with AI
      </h1>
      <div className="h-[min(60vh,800px)] bg-gray-400 bg-opacity-30 rounded p-16 flex flex-col ">
        <MessagesContainer />
      </div>
    </div>
  );
}
