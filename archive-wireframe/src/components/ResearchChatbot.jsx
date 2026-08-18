import { useEffect, useRef, useState } from "react";

import {
  FiMessageCircle,
  FiX,
  FiSend,
  FiCpu,
  FiBookOpen,
  FiDollarSign,
  FiFileText,
  FiUsers,
  FiArrowUpRight,
  FiMinimize2
} from "react-icons/fi";

import "../styles/ResearchChatbot.css";


function ResearchChatbot() {

  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const messagesEndRef = useRef(null);


  /* =====================================================
     INITIAL MESSAGES
  ===================================================== */

  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: "bot",
      text: "Hello! I'm ResearchHub AI."
    },
    {
      id: 2,
      sender: "bot",
      text:
        "I can help you explore publications, funding, patents, researchers and organizations."
    }
  ]);


  /* =====================================================
     QUICK QUESTIONS
  ===================================================== */

  const quickQuestions = [
    {
      icon: <FiBookOpen />,
      text: "Explore publications"
    },
    {
      icon: <FiDollarSign />,
      text: "Funding insights"
    },
    {
      icon: <FiFileText />,
      text: "Explore patents"
    },
    {
      icon: <FiUsers />,
      text: "Find researchers"
    }
  ];


  /* =====================================================
     AUTO SCROLL
  ===================================================== */

  useEffect(() => {

    if (messagesEndRef.current) {

      messagesEndRef.current.scrollIntoView({
        behavior: "smooth"
      });

    }

  }, [messages, isTyping]);


  /* =====================================================
     FOCUS INPUT
  ===================================================== */

  useEffect(() => {

    if (!isOpen) return;

    const timer = setTimeout(() => {

      const input = document.getElementById(
        "research-chat-input"
      );

      if (input) {
        input.focus();
      }

    }, 300);

    return () => clearTimeout(timer);

  }, [isOpen]);


  /* =====================================================
     RESPONSE ENGINE
  ===================================================== */

  const generateResponse = (text) => {

    const lower = text.toLowerCase();


    if (
      lower.includes("publication") ||
      lower.includes("paper")
    ) {

      return (
        "You can explore indexed research publications from the Publications section. You can also search publications using keywords and inspect their research details."
      );

    }


    if (
      lower.includes("funding") ||
      lower.includes("grant") ||
      lower.includes("award")
    ) {

      return (
        "The Funding section lets you explore research projects, organizations, fiscal years and award amounts. You can also sort funding projects by award amount or year."
      );

    }


    if (
      lower.includes("patent") ||
      lower.includes("innovation")
    ) {

      return (
        "The Patents section provides access to research and innovation records. You can explore patent information and identify innovation activity."
      );

    }


    if (
      lower.includes("researcher") ||
      lower.includes("scientist")
    ) {

      return (
        "You can explore researcher profiles and discover researchers associated with different research areas."
      );

    }


    if (
      lower.includes("organization") ||
      lower.includes("institution")
    ) {

      return (
        "The Organizations section helps you explore research institutions and their research activity."
      );

    }


    if (
      lower.includes("dashboard") ||
      lower.includes("overview")
    ) {

      return (
        "The Dashboard provides a centralized view of publications, funding, patents, organizations and researchers, along with research analytics and visual insights."
      );

    }


    if (
      lower.includes("hello") ||
      lower.includes("hi") ||
      lower.includes("hey")
    ) {

      return (
        "Hello! 👋 I'm ready to help you explore your research intelligence dashboard."
      );

    }


    return (
      "I can help you explore publications, funding, patents, researchers and organizations. Try one of the quick exploration options below."
    );

  };


  /* =====================================================
     SEND MESSAGE
  ===================================================== */

  const sendMessage = (text = message) => {

    const cleanText = text.trim();

    if (!cleanText || isTyping) {
      return;
    }


    const userMessage = {

      id: Date.now(),

      sender: "user",

      text: cleanText

    };


    setMessages((prev) => [
      ...prev,
      userMessage
    ]);


    setMessage("");

    setIsTyping(true);


    setTimeout(() => {

      const botMessage = {

        id: Date.now() + 1,

        sender: "bot",

        text: generateResponse(cleanText)

      };


      setMessages((prev) => [
        ...prev,
        botMessage
      ]);


      setIsTyping(false);

    }, 800);

  };


  /* =====================================================
     SUBMIT
  ===================================================== */

  const handleSubmit = (e) => {

    e.preventDefault();

    sendMessage();

  };


  /* =====================================================
     TOGGLE CHAT
  ===================================================== */

  const toggleChat = () => {

    setIsOpen((prev) => !prev);

  };


  return (

    <>

      {/* =================================================
          FLOATING AI AMBIENT GLOW
      ================================================= */}

      <div
        className={`research-ai-glow ${
          isOpen
            ? "research-ai-glow-open"
            : ""
        }`}
      />


      {/* =================================================
          CHAT PANEL
      ================================================= */}

      <div
        className={`research-chat-wrapper ${
          isOpen
            ? "research-chat-wrapper-visible"
            : ""
        }`}
        aria-hidden={!isOpen}
      >

        <div className="research-chat-window">


          {/* =================================================
              HEADER
          ================================================= */}

          <div className="research-chat-header">

            <div className="research-chat-brand">

              <div className="research-chat-logo">

                <FiCpu />

              </div>


              <div>

                <div className="research-chat-title">
                  ResearchHub AI
                </div>


                <div className="research-chat-status">

                  <span className="status-dot"></span>

                  Research assistant

                </div>

              </div>

            </div>


            <div className="research-chat-header-actions">

              <button
                className="research-chat-minimize"
                onClick={() =>
                  setIsOpen(false)
                }
                aria-label="Minimize chatbot"
              >

                <FiMinimize2 />

              </button>


              <button
                className="research-chat-close"
                onClick={() =>
                  setIsOpen(false)
                }
                aria-label="Close chatbot"
              >

                <FiX />

              </button>

            </div>

          </div>


          {/* =================================================
              SCAN LINE
          ================================================= */}

          <div className="research-ai-scan-line"></div>


          {/* =================================================
              MESSAGES
          ================================================= */}

          <div className="research-chat-messages">


            {/* INTRO */}
            <div className="research-chat-intro">

              <div className="intro-orbit">

                <div className="intro-core">

                  <FiCpu />

                </div>

              </div>


              <h3>

                Research intelligence,

                <span>
                  {" "}simplified.
                </span>

              </h3>


              <p>

                Ask me about the research data
                available across your platform.

              </p>

            </div>


            {/* MESSAGE LIST */}

            {messages.map((item) => (

              <div
                key={item.id}
                className={`research-message ${
                  item.sender === "user"
                    ? "research-message-user"
                    : "research-message-bot"
                }`}
              >

                {item.sender === "bot" && (

                  <div className="message-avatar">

                    <FiCpu />

                  </div>

                )}


                <div className="message-bubble">

                  {item.text}

                </div>

              </div>

            ))}


            {/* TYPING */}

            {isTyping && (

              <div className="research-message research-message-bot">

                <div className="message-avatar">

                  <FiCpu />

                </div>


                <div className="message-bubble typing-bubble">

                  <span></span>
                  <span></span>
                  <span></span>

                </div>

              </div>

            )}


            {/* =================================================
                QUICK QUESTIONS
            ================================================= */}

            {!isTyping && (

              <div className="quick-question-section">

                <div className="quick-question-label">

                  QUICK EXPLORATION

                </div>


                <div className="quick-question-grid">

                  {quickQuestions.map(
                    (question, index) => (

                      <button
                        key={index}
                        className="quick-question"
                        onClick={() =>
                          sendMessage(
                            question.text
                          )
                        }
                      >

                        <span className="quick-icon">

                          {question.icon}

                        </span>


                        <span className="quick-question-text">

                          {question.text}

                        </span>


                        <FiArrowUpRight />

                      </button>

                    )
                  )}

                </div>

              </div>

            )}


            <div ref={messagesEndRef} />

          </div>


          {/* =================================================
              INPUT
          ================================================= */}

          <form
            className="research-chat-input-area"
            onSubmit={handleSubmit}
          >

            <div className="research-chat-input-wrapper">

              <input
                id="research-chat-input"
                type="text"
                placeholder="Ask ResearchHub AI..."
                value={message}
                onChange={(e) =>
                  setMessage(e.target.value)
                }
                disabled={isTyping}
              />


              <button
                type="submit"
                className={`research-chat-send ${
                  message.trim()
                    ? "research-chat-send-active"
                    : ""
                }`}
                disabled={
                  !message.trim() ||
                  isTyping
                }
                aria-label="Send message"
              >

                <FiSend />

              </button>

            </div>


            <div className="research-chat-disclaimer">

              ResearchHub AI · Intelligence assistant

            </div>

          </form>

        </div>

      </div>


      {/* =================================================
          FLOATING BUTTON
      ================================================= */}

      <button
        className={`research-chat-button ${
          isOpen
            ? "research-chat-button-open"
            : ""
        }`}
        onClick={toggleChat}
        aria-label={
          isOpen
            ? "Close ResearchHub AI"
            : "Open ResearchHub AI"
        }
      >

        <span className="chat-button-ring"></span>


        <span className="chat-button-icon">

          {isOpen ? (
            <FiX />
          ) : (
            <FiMessageCircle />
          )}

        </span>


        {!isOpen && (

          <span className="chat-button-label">

            ResearchHub AI

          </span>

        )}


        {!isOpen && (

          <span className="chat-button-status"></span>

        )}

      </button>

    </>

  );

}


export default ResearchChatbot;