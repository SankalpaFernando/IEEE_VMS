import supabase from "../supabase/client"

export const getUserAuth = async () => {

    const res = await supabase.auth.getUser();
    console.log(res);
    if(!res.data.user) return null;
    console.log(res.data.user.id);
    const {data,error} = await supabase.from('users').select("*,ou_volunteer(ou_id,role),volunteer_project(*)").eq('uid',res.data.user.id)
    if(error){
        console.log(error);
        return null;
    };
    console.log(data);

    return data[0];

}

export const getUserAccess =  (user,allowedAccessType,allowedOrgs=[{}])=>{
    
    const userRoles = user?.ou_volunteer.map((ou)=>({ou_id:ou.ou_id,role:ou.role}));

    if(user==null) return false;
    
    if(user.account_type == "SUPER_ADMIN") return true;
    
    if(allowedAccessType.includes(user.account_type)) return true;

    for(let role of userRoles){
        for(let org of allowedOrgs){
            if(role.ou_id == org.ou_id && org.role.includes(role.role)) return true;
        }
    }


    return false;

}


export const getOrgs = async ()=>{
    const {data,error} = await supabase.from('ous').select("*")
    if(error){
        console.log(error);
        return null;
    };
    return data;
}