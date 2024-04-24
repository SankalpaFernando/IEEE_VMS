import { create } from "zustand";
import { getUserAuth } from "./auth";

export const useUserStore = create((set) => ({
    user: null,
    loading: false,
    fetchUser: async() =>{
        set({loading:true});
        const user = await getUserAuth();
        console.log(user);
        set({user,loading:false});
    },
    logout: () => set({ user: null }),

}));