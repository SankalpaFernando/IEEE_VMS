import { Card, Input, Button } from "@nextui-org/react"
import { useFormik } from 'formik';
import supabase from "../supabase/client";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import Logo from '../assets/logo.png';
import Swal from "sweetalert2";

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
            // Wrong email or password
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: 'Wrong email or password!',

            })
            setIsLoading(false);
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
            <Card className="w-[400px] p-5 m-auto">
                <div className=" items-center flex justify-center">
                    <img src={Logo} className='w-10  h-10 rounded-full' />
                </div>
                
                <h1 className="text-xl text-center font-light mt-2">IEEE SB UoJ</h1>
                <h1 className="text-xl text-center font-semibold mb-4 mt-1">Volunteer Management System</h1>
                
                
                <form className="pb-4" >
                    <Input type="email" name="email" variant="bordered" className="my-2"  placeholder="Enter your email" onChange={handleChange}  />
                    <Input type="password" name="password" variant="bordered" className="my-2" placeholder="Enter your password" onChange={handleChange}/>
                    <Button color="primary" onClick={submitLogin} isLoading={isLoading} fullWidth className="mt-2" variant="solid">Sign In</Button>
                </form>

            </Card>
        </div>
    )
}