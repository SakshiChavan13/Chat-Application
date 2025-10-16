import { use } from "react";
import { usePage } from "@inertiajs/react";
import { useEffect, useState } from "react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { PencilSquareIcon } from "@heroicons/react/24/solid";
import TextInput from "@/Components/TextInput";
import ConversationItem from "@/Components/App/ConversationItem";

const ChatLayout = ({ children }) => {
    const page = usePage();
    const conversations = page.props.conversations;
    const selectedConversation = page.props.selectedConversation;
    const [localConversations, setLocalConversations] = useState([]);
    const [sortedConversations, setSortedConversations] = useState([]);

    const [onlineUsers, setOnlineUsers] = useState([]);

    const isUserOnline = (userId) => onlineUsers[userId];
    console.log("conversations", conversations);
    console.log("selectedConversation", selectedConversation);

    const onSearch = (e) => {
        const search = e.target.value.toLowerCase();
        setLocalConversations(
            conversations.filter((conversation) => {
                return (
                    conversation.name.toLowerCase().includes(search)
                );
            })
        );
    };

    useEffect(() => {
        setSortedConversations(
            localConversations.sort((a, b) => {
                if (a.blocked_at && b.blocked_at) {
                    return a.blocked_at > b.blocked_at ? 1 : -1;
                } else if (a.blocked_at) {
                    return 1;
                } else if (b.blocked_at) {
                    return -1;
                }

                if (a.last_message_date && b.last_message_date) {
                    return b.last_message_date.localeCompare(
                        a.last_message_date
                    );
                } else if (a.last_message_date) {
                    return -1;
                } else if (b.last_message_date) {
                    return 1;
                } else {
                    return 0;
                }
            })
        );
    }, [localConversations]);

    useEffect(() => {
        setLocalConversations(conversations);
    }, [conversations]);

    useEffect(() => {
        setLocalConversations(conversations);
    }, [localConversations]);

    useEffect(() => {
        Echo.join("online")
            .here((users) => {
                const onlineUsersObj = Object.fromEntries(
                    users.map((user) => [user.id, user])
                );
                setOnlineUsers((prevOnlineUsers) => ({
                    ...prevOnlineUsers,
                    ...onlineUsersObj,
                }));
            })
            .joining((user) => {
                setOnlineUsers((prevOnlineUsers) => {
                    const updatedUsers = { ...prevOnlineUsers };
                    updatedUsers[user.id] = user;
                    return updatedUsers;
                });
            })
            .leaving((user) => {
                setOnlineUsers((prevOnlineUsers) => {
                    const updatedUsers = { ...prevOnlineUsers };
                    delete updatedUsers[user.id];
                    return updatedUsers;
                });
            });

        return () => {
            Echo.leave("online");
        };
    }, []);
    return (
        <>
           <div className="flex-1 w-full flex overflow-hidden">

            <div className={`transition-all w-full sm:w-[260px] md:w-[380px] bg-slate-800 flex  flex-col overflow-hidden 
            ${selectedConversation ? "-ml-[100%] sm:ml-0" : ""}`}
            
            >

                <div className="flex items-center justify-center py-2 px-3 text-xl font-medium bg-slate-900 text-gray-200">
                     My Conversations

                     <div className="tooltip tooltip-left"
                          data-tip="Create new Group"
                          >
                            <button className="text-gray-400 hover:text-gray-200">
                                <PencilSquareIcon className="h-4 w-4 ml-2 inline-block" />

                            </button>
                          </div>
                </div>

                <div className="p-3">
                <TextInput
                    onKeyUp = {onSearch}
                    placeholder = "Filter users and groups"
                    className = "w-full"
                    />

                </div>

                <div className="flex-3 overflow-y-auto">
                    {sortedConversations && sortedConversations.map((conversation) => (
                        <ConversationItem
                            key={`${conversation.is_group ? "group_" : "user_"}${conversation.id}`}
                            conversation={conversation}
                            online={!!isUserOnline(conversation.id)}
                           // onClick={() => handleConversationClick(conversation)}
                            selectedConversation={selectedConversation}
                        />
                    ))}
                </div>

            <div className="flex-1 flex flex-col overflow-hidden">
                {children}
                </div>

            </div>

              </div>
        
        
        </>
    );
};

export default ChatLayout;
