import React, { useCallback, useEffect, useState } from "react";
import { useChat } from "../../lib/contexts/chat.context";

interface Props {}

type Message = {
  id: string;
  content: string;
};

const generateRandomMessage = (): Message => {
  const randomString = Math.random().toString(36).substring(7);
  return {
    id: randomString,
    content: randomString,
  };
};

export default function MessagesContainer({}: Props) {
  const [msgInput, setMessageInput] = useState("");

  const messagesContainerRef = React.useRef<HTMLDivElement>(null!);

  const { messages: newMessages, submitMessage } = useChat();

  const [messages, setMessages] = useState<Message[]>(newMessages);
  const [shouldScroll, setShouldScroll] = useState(true);

  if (messages !== newMessages) {
    const scrolledToBottom =
      messagesContainerRef.current.scrollTop +
        messagesContainerRef.current.clientHeight ===
      messagesContainerRef.current.scrollHeight;
    setShouldScroll(shouldScroll || scrolledToBottom);
    setMessages(newMessages);
  }

  const scrollToBottom = useCallback(() => {
    messagesContainerRef.current.scrollTop =
      messagesContainerRef.current.scrollHeight;
  }, []);

  useEffect(() => {
    if (shouldScroll) {
      scrollToBottom();
      setShouldScroll(false);
    }
  }, [scrollToBottom, shouldScroll]);

  const onSubmitMessage = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await submitMessage(msgInput);
      setMessageInput("");
      setShouldScroll(true);
    } catch (error) {
      alert("Failed to submit message");
    }
  };

  return (
    <>
      <div
        className="grow flex flex-col overflow-y-auto"
        ref={messagesContainerRef}
      >
        <div className="flex flex-col-reverse grow gap-8 py-16">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex flex-col gap-4 rounded-24 px-16 py-8 text-white ${
                true
                  ? "self-start bg-gradient-to-br from-indigo-500 via-purple-500 to-purple-600 "
                  : "self-end bg-blue-600"
              }`}
            >
              <p className="text-body3">{message.content}</p>
            </div>
          ))}
        </div>
      </div>
      <form onSubmit={onSubmitMessage} className="">
        <div className="flex gap-16 bg-gray-200 p-8 rounded-8 [&:has(input:focus)]:outline outline-gray-700 outline-2">
          <input
            className="grow p-16 bg-transparent focus:outline-none"
            type="text"
            placeholder="Type your message here..."
            value={msgInput}
            onChange={(e) => setMessageInput(e.target.value)}
          />
          <button className="bg-gradient-to-br from-indigo-500 via-purple-500 to-purple-600 text-body3 px-16 py-4 shrink-0 rounded-8 font-bold active:scale-90 text-white">
            Send Message
          </button>
        </div>
      </form>
    </>
  );
}
