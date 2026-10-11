import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  ArrowLeft,
  Phone,
  Video,
  MoreVertical,
  Plus,
  Smile,
  Send,
} from "lucide-react";

import "../styles/ChatScroll.css";

gsap.registerPlugin(ScrollTrigger);

type Sender = "user" | "other";

interface Message {
  id: number;
  sender: Sender;
  text: string;
  time: string;
}

const messages: Message[] = [
  {
    id: 1,
    sender: "user",
    text: "Hey, are you free for a minute?",
    time: "10:24",
  },
  {
    id: 2,
    sender: "other",
    text: "For you? Always. What's up?",
    time: "10:25",
  },
  {
    id: 3,
    sender: "user",
    text: "I've been thinking about something lately.",
    time: "10:26",
  },
  {
    id: 4,
    sender: "other",
    text: "That sounds suspicious. Should I be worried?",
    time: "10:27",
  },
  {
    id: 5,
    sender: "user",
    text: "No, haha. Do you remember how we first met?",
    time: "10:28",
  },
  {
    id: 6,
    sender: "other",
    text: "Of course I do. You literally spilled coffee everywhere.",
    time: "10:29",
  },
  {
    id: 7,
    sender: "user",
    text: "Okay, first of all, that coffee was fighting for its life.",
    time: "10:30",
  },
  {
    id: 8,
    sender: "other",
    text: "And somehow that became the beginning of everything.",
    time: "10:31",
  },
  {
    id: 9,
    sender: "user",
    text: "It's weird how the smallest moments can change everything.",
    time: "10:32",
  },
  {
    id: 10,
    sender: "other",
    text: "Maybe they're not that small if they stay with us.",
    time: "10:33",
  },
  {
    id: 11,
    sender: "user",
    text: "I think that's what I've been trying to figure out.",
    time: "10:34",
  },
  {
    id: 12,
    sender: "other",
    text: "Then tell me. I'm listening.",
    time: "10:35",
  },
];

export default function ChatScroll() {
  const sectionRef = useRef<HTMLElement>(null);
  const windowRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  const messageRefs = useRef<(HTMLDivElement | null)[]>([]);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    const chatWindow = windowRef.current;
    const viewport = viewportRef.current;
    const track = trackRef.current;

    if (!section || !chatWindow || !viewport || !track) {
      return;
    }

    const ctx = gsap.context(() => {
      const elements = messageRefs.current.filter(
        (element): element is HTMLDivElement =>
          element !== null
      );

      if (!elements.length) return;

      let timeline: gsap.core.Timeline | null = null;
      let resizeObserver: ResizeObserver | null = null;

      const buildTimeline = () => {
        if (timeline) {
          timeline.scrollTrigger?.kill();
          timeline.kill();
          timeline = null;
        }

        const viewportHeight = viewport.clientHeight;

        if (!viewportHeight) return;

        gsap.set(track, { y: 0 });

        gsap.set(elements, {
          clearProps: "transform",
          autoAlpha: 0,
        });

        // Measure the natural position of every message.
        const positions = elements.map((element) => ({
          top: element.offsetTop,
          height: element.offsetHeight,
        }));

        // Calculate the position that centers each message.
        const centeredPositions = positions.map((position) => {
          const messageCenter =
            position.top + position.height / 2;

          return viewportHeight / 2 - messageCenter;
        });

        // Start with the first message in the center.
        gsap.set(track, {
          y: centeredPositions[0],
        });

        // Nothing is visible initially.
        gsap.set(elements, {
          autoAlpha: 0,
          y: 22,
          scale: 0.96,
          transformOrigin: "center center",
        });

        timeline = gsap.timeline({
          scrollTrigger: {
            trigger: section,
            start: "top top",
            end: () => `+=${messages.length * 260}`,
            pin: chatWindow,
            pinSpacing: true,
            scrub: 0.6,
            anticipatePin: 1,
            invalidateOnRefresh: true,
          },
        });

        elements.forEach((element, index) => {
          // Move the conversation upward to center the next bubble.
          if (index > 0) {
            timeline!.to(
              track,
              {
                y: centeredPositions[index],
                duration: 1,
                ease: "none",
              },
              index
            );
          }

          // Pop the incoming message into existence.
          timeline!.to(
            element,
            {
              autoAlpha: 1,
              y: 0,
              scale: 1,
              duration: 0.35,
              ease: "back.out(1.4)",
            },
            index === 0 ? 0 : index + 0.15
          );
        });
      };

      buildTimeline();

      resizeObserver = new ResizeObserver(() => {
        ScrollTrigger.refresh();
      });

      resizeObserver.observe(viewport);

      resizeObserver.observe(viewport);
      resizeObserver.observe(chatWindow);

      ScrollTrigger.refresh();

      return () => {
        resizeObserver?.disconnect();
        timeline?.scrollTrigger?.kill();
        timeline?.kill();
      };
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <main className="conversation-page">
      {/* INTRO */}
      {/* <section className="conversation-intro">
        <span className="conversation-eyebrow">
          A LITTLE STORY
        </span>

        <h1>
          Every conversation
          <br />
          <span>starts somewhere.</span>
        </h1>

        <p>
          Sometimes the smallest messages
          change everything.
        </p>

        <div className="conversation-scroll-hint">
          <span className="scroll-hint-line" />
          <span>SCROLL TO EXPERIENCE</span>
        </div>
      </section> */}

      {/* CHAT SECTION */}
      <section
        className="conversation-section"
        ref={sectionRef}
      >
        <div
          className="conversation-window"
          ref={windowRef}
        >
          {/* FIXED HEADER */}
          <header className="conversation-header">
            <button
              className="conversation-back"
              type="button"
              aria-label="Go back"
            >
              <ArrowLeft size={19} />
            </button>

            <div className="conversation-avatars">
              <div className="conversation-avatar avatar-primary">
                A
              </div>

              <div className="conversation-avatar avatar-secondary">
                J
              </div>
            </div>

            <div className="conversation-contact">
              <h3>Alex &amp; Jordan</h3>

              <span className="conversation-status">
                <i />
                Online
              </span>
            </div>

            <div className="conversation-actions">
              <button type="button" aria-label="Call">
                <Phone size={18} />
              </button>

              <button type="button" aria-label="Video call">
                <Video size={19} />
              </button>

              <button type="button" aria-label="More options">
                <MoreVertical size={19} />
              </button>
            </div>
          </header>

          {/* CHAT BODY */}
          <div className="conversation-body">
            <div className="conversation-date">
              <span>Today</span>
            </div>

            {/* STATIONARY VIEWPORT */}
            <div
              className="conversation-viewport"
              ref={viewportRef}
            >
              {/* MOVING MESSAGE TRACK */}
              <div
                className="conversation-track"
                ref={trackRef}
              >
                {messages.map((message, index) => (
                  <div
                    key={message.id}
                    ref={(element) => {
                      messageRefs.current[index] = element;
                    }}
                    className={`message-row message-row--${message.sender}`}
                  >
                    {message.sender === "other" && (
                      <div className="message-avatar message-avatar--other">
                        J
                      </div>
                    )}

                    <div className="message-content">
                      <div className="message-bubble">
                        <p>{message.text}</p>
                      </div>

                      <div className="message-meta">
                        <span>{message.time}</span>

                        {message.sender === "user" && (
                          <span className="message-read">
                            ✓✓
                          </span>
                        )}
                      </div>
                    </div>

                    {message.sender === "user" && (
                      <div className="message-avatar message-avatar--user">
                        A
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* FIXED INPUT */}
            <footer className="conversation-footer">
              <button
                type="button"
                aria-label="Add attachment"
              >
                <Plus size={20} />
              </button>

              <div className="conversation-input">
                <span>Message...</span>
                <Smile size={19} />
              </div>

              <button
                className="conversation-send"
                type="button"
                aria-label="Send message"
              >
                <Send size={17} />
              </button>
            </footer>
          </div>
        </div>

      
      </section>
    </main>
  );
}