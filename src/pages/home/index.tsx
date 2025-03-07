import { useCallback, useEffect, useRef, useState } from "react";
import { Button, Input, Image, Modal } from "antd"
import { getChatHistory, addChatHistory, getChatHistoryItem, addChatHistoryItem } from "../../network/api/chat"
import jsCookie from "js-cookie";
import { EventSourcePolyfill } from "event-source-polyfill";
import "./chat.scss"

const HeaderComp = (prop) => {
  return (
    <div className="flex justify-center border-b-1 border-gray-200 py-4">
      {prop.title}
    </div>
  )
}


const SliderComp = (prop) => {
  return (
    <div>
      {/* <div className="my-4 mx-4"><Button type="primary" block>开启新对话</Button></div>
      <div className="border-b border-gray-200 my-4"></div> */}
      <div>
        {
          prop.chatHistory.map((item, index) => (
            <div className={"rounded-sm py-2 text-xs mx-2 mt-2 px-2 cursor-pointer " + (prop.chatIndex === index ? "bg-gray-200" : "")} key={item.id} onClick={() => prop.changeChat(item, index)}>{item.title}</div>
          ))
        }
      </div>
    </div>
  )
}

const ChatComp = (prop) => {
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [prop.chatList]);

  return (
    <div className="flex-1 p-4 overflow-y-auto scroll-bar-style">
      {prop.chatList.map((chat) => (
        <div key={chat.id} className={chat.type == 1 ? "flex mb-4 justify-start text-sm" : "flex justify-end mb-4 text-sm"} >
          <div className={chat.type == 1 ? '' : 'user-chat'}>
            {chat.content}
          </div>
        </div>
      ))}

      <div ref={messagesEndRef}></div>
    </div>
  )
}

const InputComp = ({ onChange, value, onSend, isLoading }) => {

  const handleKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      onSend()
    }
  }

  return (
    <div className="m-4 relative">
      <Input.TextArea autoSize value={value} style={{ minHeight: '80px' }} onKeyDown={handleKeyDown}
        onChange={onChange}></Input.TextArea>
    </div>
  )

}

const HomePage = () => {
  const [title] = useState("迅捷诚 AI 知识库")
  const [chatList, setChatList] = useState([] as any)
  const [chatValue, setChatValue] = useState("")
  const [chatHistory, setChatHistory] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [chatIndex, setChatIndex] = useState(0)

  useEffect(() => {
    const getChat = async () => {
      const chatHistory = await chatHistoryRequest()
      const id = chatHistory[chatIndex].id;

      const data = await getChatHistoryItem({ chat_history_id: id })

      console.log(data.data);
      if (data.code === 200) {
        setChatList(data.data);
      }
    }

    getChat();
  }, [])

  const onChatChange = (e) => {
    setChatValue(e.target.value)
  }

  const sendMessage = async () => {
    // 判断是否有信息，如果没有就新建一个对话
    /* if (!chatList.length) {
      await addChatHistory({ title: chatValue });
    } */

    setChatValue("")

    const humanChat = { type: 0, content: chatValue, id: Date.now(), };
    let newChat = [...chatList, humanChat]

    setChatList(newChat)
    // setIsLoading(true)

    // const data: any = await invoke({ input: { "input": chatValue } })
    const eventSource = new EventSourcePolyfill(import.meta.env.VITE_API_URL + `/chain/stream?chat_history_id=${chatHistory[chatIndex]?.id}&input=${encodeURIComponent(chatValue)}`, {
      method: "post",
      headers: {
        "authorization": 'Bearer ' + jsCookie.get("authorization"),
        'Content-Type': 'application/json', // 设置请求头
      }
    });

    // 

    eventSource.onmessage = async (event) => {
      const data = JSON.parse(event.data);

      if (data.type == 'END') {
        eventSource.close();
        setIsLoading(false)
        newChat[newChat.length - 1].status = "finish";
        setChatList([...newChat])
      } else if (data.type == 'START') {
        const aiChat = { type: 1, content: "", id: data.value, status: "loading" }
        newChat = [...newChat, aiChat]
        setChatList(newChat)
      } else {
        newChat[newChat.length - 1].content += data.value;
        setChatList([...newChat])
      }
    };

    eventSource.onerror = () => {
      eventSource.close();
    };
  }

  const chatHistoryRequest = async () => {
    const data = await getChatHistory()

    if (data.code === 200) {
      setChatHistory(data.data)
      return data.data;
    }
  }

  const changeChat = async (item, index) => {
    setChatIndex(index)

    if (item.id) {
      const data = await getChatHistoryItem({ chat_history_id: item.id })
      console.log(data.data);

      if (data.code === 200) {
        setChatList(data.data);
      }
    }
  }
  /* 
    const login = async () => {
      const data = await userLogin({ username: "admin", password: "123456" })
      if (data.code === 200) {
        console.log(data)
        jsCookie.set("authorization", data.data.accessToken)
      }
    }
   */
  return (
    <div className="h-screen flex flex-col m-auto overflow-hidden">
      <HeaderComp title={title} />

      <div className="flex flex-1 overflow-hidden">
        <div className="w-[250px] border-r border-gray-200">
          <SliderComp chatHistory={chatHistory} chatIndex={chatIndex} changeChat={changeChat}></SliderComp>
        </div>
        <div className="h-full w-full">
          <div className='h-full w-[900px] m-auto flex flex-1 flex-col'>
            <ChatComp chatList={chatList} />
            <InputComp value={chatValue} isLoading={isLoading} onChange={onChatChange} onSend={sendMessage} />
          </div>
        </div>
      </div>
    </div >
  )
};

export default HomePage;
