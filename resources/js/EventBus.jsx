import React from "react";

export const EventBusContext = React.createContext();

export const EventBusProvider = ({ children }) => {
    const events = React.useRef({}); // ✅ useRef instead of useState

    const emit = (name, data) => {
        if (events.current[name]) {
            for (let cb of events.current[name]) {
                cb(data);
            }
        }
    };

    const on = (name, cb) => {
        if (!events.current[name]) {
            events.current[name] = [];
        }
        events.current[name].push(cb);

        return () => {
            events.current[name] = events.current[name].filter(
                (callback) => callback !== cb
            );
        };
    };

    return (
        <EventBusContext.Provider value={{ emit, on }}>
            {children}
        </EventBusContext.Provider>
    );
};

export const useEventBus = () => React.useContext(EventBusContext);
