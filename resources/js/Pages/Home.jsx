import AttachmentPreviewModal from "@/Components/App/AttachmentPreviewModal";
import ConversationHeader from "@/Components/App/ConversationHeader";
import MessageInput from "@/Components/App/MessageInput";
import MessageItem from "@/Components/App/MessageItem";
import { useEventBus } from "@/EventBus";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import ChatLayout from "@/Layouts/ChatLayout";
import { ChatBubbleLeftRightIcon } from "@heroicons/react/24/solid";
import { Head } from "@inertiajs/react";
import { useRef, useState, useEffect, useCallback } from "react";

function Home({ selectedConversation = null, messages = null }) {
    const [localMessages, setLocalMessages] = useState([]);
    const [noMoreMessages, setNoMoreMessages] = useState(false);
    const [scrollFromBottom, setScrollFromBottom] = useState(0);
    const messagesCtrRef = useRef(null);
    const loadMoreIntersect = useRef(null);
    const [showAttachmentPreview, setShowAttachmentPreview] = useState(false);
    const [previewAttachment, setPreviewAttachment] = useState({});
    
    const { on } = useEventBus();

    const messageCreated = (message) => {
        if (
            selectedConversation &&
            selectedConversation.is_group &&
            selectedConversation.id == message.group_id
        ) {
            setLocalMessages((prevMessages) => {
                const exists = prevMessages.some((m) => m.id === message.id);
                if (exists) return prevMessages;
                return [...prevMessages, message];
            });
        }

        if (
            (selectedConversation &&
                selectedConversation.is_user &&
                selectedConversation.id == message.sender_id) ||
            selectedConversation.id == message.receiver_id
        ) {
            setLocalMessages((prevMessages) => [...prevMessages, message]);
        }
    };

    const loadMoreMessages = useCallback(() => {
        if (noMoreMessages) {
            return;
        }
        const firstMessage = localMessages[0];
        axios
            .get(route("message.loadOlder", firstMessage.id))
            .then(({ data }) => {
                if (data.data.length === 0) {
                    setNoMoreMessages(true);
                    return;
                }

                const scrollHeight = messagesCtrRef.current.scrollHeight;
                const scrollTop = messagesCtrRef.current.scrollTop;
                const clientHeight = messagesCtrRef.current.clientHeight;

                const tmpScrollFromBottom =
                    scrollHeight - scrollTop - clientHeight;
                console.log("tmpScrollFromBottom ", tmpScrollFromBottom);
                setScrollFromBottom(scrollHeight - scrollTop - clientHeight);

                setLocalMessages((prevMessages) => {
                    const merged = [...data.data.reverse(), ...prevMessages];
                    // Filter to ensure unique messages by ID
                    const unique = merged.filter(
                        (msg, index, self) =>
                            index === self.findIndex((m) => m.id === msg.id)
                    );
                    return unique;
                });
            });
    }, [localMessages,noMoreMessages]);

    const onAttachmentClick = (attachments, ind) => {
        setPreviewAttachment({
            attachments,
            ind,

        });

        setShowAttachmentPreview(true);
    };

    useEffect(() => {
        setTimeout(() => {
            if (messagesCtrRef.current) {
                messagesCtrRef.current.scrollTop =
                    messagesCtrRef.current.scrollHeight;
            }
        }, 10);
        const offCreated = on("message.created", messageCreated);

        setScrollFromBottom(0);
        setNoMoreMessages(false);
        
        return () => {
            offCreated();
        };
    }, [selectedConversation]);

    useEffect(() => {
        // console.log(messages.data);

        setLocalMessages(messages ? [...messages.data].reverse() : []);
    }, [messages]);

    useEffect(() => {
        if (messagesCtrRef.current && scrollFromBottom !== null) {
            messagesCtrRef.current.scrollTop =
                messagesCtrRef.current.scrollHeight -
                messagesCtrRef.current.offsetHeight -
                scrollFromBottom;
        }

        if (noMoreMessages) {
            return;
        }

        const observer = new IntersectionObserver(
            (entries) =>
                entries.forEach(
                    (entry) => entry.isIntersecting && loadMoreMessages()
                ),
            {
                rootMargin: "0px 0px 250px 0px",
            }
        );

        if (loadMoreIntersect.current) {
            setTimeout(() => {
                observer.observe(loadMoreIntersect.current);
            }, 100);
        }

        return () => {
            observer.disconnect();
        };
    }, [localMessages]);

    return (
        <>
            {!messages && (
                <div className="flex flex-col gap-8 justify-center items-center text-center h-full opacity-35">
                    <div className="text-2xl md:text-4xl p-16 text-slate-200">
                        Please select conversation to see messages
                    </div>
                    <ChatBubbleLeftRightIcon className="w-32 h-32 inline-block" />
                </div>
            )}

            {messages && (
                <>
                    <ConversationHeader
                        selectedConversation={selectedConversation}
                    />
                    <div
                        ref={messagesCtrRef}
                        className="flex-1 overflow-y-auto p-5"
                    >
                        {localMessages.length === 0 && (
                            <div className="flex justify-center items-center h-full">
                                <div className="text-lg text-slate-200">
                                    No messages found
                                </div>
                            </div>
                        )}
                        {localMessages.length > 0 && (
                            <div className="flex-1 flex flex-col">
                                <div ref={loadMoreIntersect}></div>

                                {localMessages.map((message) => (
                                    <MessageItem
                                        key={`${message.id}-${message.created_at}`}
                                        message={message}
                                        attachmentClick={onAttachmentClick}

                                    />
                                ))}
                            </div>
                        )}
                    </div>
                    <MessageInput conversation={selectedConversation} />
                </>
            )}

            {previewAttachment.attachments && (
                <AttachmentPreviewModal
                    attachments={previewAttachment.attachments}
                    index={previewAttachment.ind}
                    show={showAttachmentPreview}
                    onClose={() => setShowAttachmentPreview(false)}
                    />
            )}
        </>
    );
}

Home.layout = (page) => {
    return (
        <AuthenticatedLayout user={page.props.auth.user}>
            <ChatLayout>{page}</ChatLayout>
        </AuthenticatedLayout>
    );
};
export default Home;
