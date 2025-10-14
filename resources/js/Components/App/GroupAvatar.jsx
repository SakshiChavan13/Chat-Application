import { UsersIcon } from "@heroicons/react/24/solid";

const GroupAvatar = ({}) =>{
    return (
        <>
        <div className={`avatar plaeholder`}>
            <div className={`bg-gray-400 text-gray-800 rounded-full w-8`}>
                <UsersIcon className="w-4"  />
            </div>
        </div>
        
        </>

    );
};

export default GroupAvatar;

