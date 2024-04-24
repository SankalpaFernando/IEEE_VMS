import { Card, Input, Button } from "@nextui-org/react"
import { useFormik } from 'formik';
import supabase from "../supabase/client";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

export default () => {

    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [formValues, setFormValues] = useState({
        email: "",
        password: ""
    });

    const submitLogin = async () => {
        setIsLoading(true);
        const { user, session, error } = await supabase.auth.signInWithPassword({
            email: formValues.email,
            password: formValues.password
        });
        if (error) {
            console.log(error);
            return;
        }
        setIsLoading(false);
        navigate("/dashboard/dashboard");

    }

    const handleChange = (e) => {
        setFormValues({ ...formValues, [e.target.name]: e.target.value });
    }

    return (
        <div className="grid place-items-center h-screen">
            <Card className="w-[350px] p-5 m-auto">
                <h1 className="text-2xl text-center mb-2 font-bold">Volunteer Management</h1>
                
                <form >
                    <Input type="email" name="email" variant="bordered" className="my-2"  placeholder="Enter your email" onChange={handleChange}  />
                    <Input type="password" name="password" variant="bordered" className="my-2" placeholder="Enter your password" onChange={handleChange}/>
                    <Button color="primary" onClick={submitLogin} isLoading={isLoading} fullWidth className="mt-2" variant="solid">Sign In</Button>
                </form>

            </Card>
        </div>
    )
}