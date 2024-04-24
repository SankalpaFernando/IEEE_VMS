import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUserStore } from "../util/store";

export default function AuthError() {

    const user = useUserStore(state => state.user);
    const navigate = useNavigate();

    useEffect(() => {
        console.log(user);
        if (!user) {
            window.location.reload();
            navigate('/dashboard/dashboard')
        }
    }, [user])

    return (
        <div className="h-screen w-screen flex justify-center items-center">
            <h1 className="text-3xl text-red-500">You are not allowed to access this page</h1>
        </div>
    )
}