import { Card, Input, Button, Progress, Select, AutocompleteItem, Autocomplete, AutocompleteSection, Chip } from "@nextui-org/react"
import { useFormik } from 'formik';
import supabase from "../supabase/client";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { EyeFilled, EyeInvisibleFilled } from "@ant-design/icons";
import { calculatePasswordStrength, getPasswordStrengthColor } from "../util/util";





export default () => {

  
    const navigate = useNavigate();
    const { resetKey } = useParams();
    const [formValues, setFormValues] = useState({
        email: "",
        password: "",
        confirm_password: "",
        intrest: []
    });

    const [isVisible, setIsVisible] = useState(false);
    const [showProgress, setShowProgress] = useState(false);
    const [error, setError] = useState({
        passwordMsg: ""
    });
    const submitChanges = async () => {
        if (calculatePasswordStrength(formValues.password) < 80) {
            setError({
                passwordMsg: "Password is too weak"
            });
            return;
        }
        if (formValues.password !== formValues.confirm_password) {
            setError({ passwordMsg: "Password does not match" });
            return;
        }

       const {data:userData} = await supabase.auth.admin.createUser({
            email: formValues.email_address,
            password: formValues.password,
            email_confirm: true
        })

        console.log()

        const { data, error } = await supabase.from('users').update({
            intrest: formValues.intrest,
            uid:userData.user.id
        }).eq('resetKey', resetKey);

    }

    const handleChange = (e) => {
        setFormValues({ ...formValues, [e.target.name]: e.target.value });
    }

    

    const getPasswordStrengthMessage = (strength) => {
        //funny messages
        if (strength <= 20) {
            return "Too Weak";
        }
        if (strength <= 60) {
            return "Weak"
        }
        if (strength <= 80) {
            return "Strong"
        }
        return "Very Strong"
    }

    useEffect(() => {
        (
            async () => {
                const { data, error } = await supabase.from('users').select('*').eq('resetKey', resetKey);
                if (error) {
                    // navigate('/login');
                    return;
                }
                if (data.length == 0) {
                    // navigate('/login');
                    return;
                }
                console.log(data);
                setFormValues({ ...formValues, ...data[0], intrest: [] });
            }
        )()

    }, [])

    useEffect(() => console.log(formValues), [formValues])

    return (
        <div className="grid place-items-center h-screen py-4">
            <Card className="w-[1000px] p-5 m-auto">
                <h1 className="text-2xl text-center mb-2 font-bold">Volunteer Management System</h1>

                <form >
                    <h2 className="text-lg font-semibold mt-4 text-gray-700">Configure Volunteer Profile</h2>
                    <div className="grid grid-cols-3 gap-2 my-4">
                        <div className=" gap-2">
                            <Input variant='faded' label="Member ID" className="my-2" disabled value={formValues.member_id} />
                            <Input variant='faded' label="First Name" className="my-2" disabled value={formValues.first_name} />
                            <Input variant='faded' label="Middle Name" className="my-2" disabled value={formValues.middle_name} />
                            <Input variant='faded' label="Last Name" className="my-2" disabled value={formValues.last_name} />
                            <Input variant='faded' label="Email" className="my-2" disabled value={formValues.email_address} />
                            <Input variant='faded' label="Membership Status" className="my-2" disabled value={formValues.ieee_status ? "Active" : "Inactive"} />
                            <div className="grid">
                                <Button color="primary" onClick={submitChanges} fullWidth className="mt-2" variant='flat' radius='sm' >Save</Button>
                            </div>
                        </div>
                        <div>
                            <Input variant='faded' label="Gender" className="my-2" disabled value={formValues.gender} />
                            <Input variant='faded' label="Address" className="my-2" disabled value={formValues.address} />
                            <Input variant='faded' label="Program" className="my-2" disabled value={formValues.program} />
                            <Input variant='faded' label="Graduation Date" className="my-2" disabled value={formValues.graduation_date} />
                            <Input variant='faded' label="Renew Year" className="my-2" disabled value={formValues.renew_year} />
                            <Input variant='faded' label="Degree" className="my-2" disabled value={formValues.degree} />
                        </div>
                        <div className=" gap-2">
                            <Input variant='faded' label="Membership Type" className="my-2" disabled value={formValues.membership_type} />
                            <Input variant='bordered' name="password" label="Password" className="my-2"
                                type={isVisible ? "text" : "password"}
                                onChange={handleChange}
                                onFocus={() => setShowProgress(true)}
                                onBlur={() => setShowProgress(false)}
                                endContent={
                                    <button className="focus:outline-none" type="button" onClick={() => setIsVisible(!isVisible)}>
                                        {isVisible ? (
                                            <EyeInvisibleFilled className="text-2xl text-default-400 pointer-events-none" />
                                        ) : (
                                            <EyeFilled className="text-2xl text-default-400 pointer-events-none" />
                                        )}
                                    </button>
                                }

                            />


                            <div className="w-[95%] mx-auto" >
                                {showProgress && <Progress size="sm" color={getPasswordStrengthColor(calculatePasswordStrength(formValues.password))} value={calculatePasswordStrength(formValues.password)} />}
                                {
                                    error.passwordMsg && (
                                        <p className="text-danger-500 text-sm">{error.passwordMsg}</p>
                                    )
                                }
                            </div >

                            <Input variant='bordered' name="confirm_password" label="Confirm Password" className="my-2"
                                type={isVisible ? "text" : "password"}
                                onChange={handleChange}
                                endContent={
                                    <button className="focus:outline-none" type="button" onClick={() => setIsVisible(!isVisible)}>
                                        {isVisible ? (
                                            <EyeInvisibleFilled className="text-2xl text-default-400 pointer-events-none" />
                                        ) : (
                                            <EyeFilled className="text-2xl text-default-400 pointer-events-none" />
                                        )}
                                    </button>
                                }

                            />
                            <Autocomplete selectionMode="multiple" label="Expert/Intrest Area" className="my-2" placeholder="Select one or more option(s)" variant="bordered" onInputChange={i => {
                                if (i == "") {
                                    return;
                                }
                                if (!formValues.intrest.includes(i)) {
                                    setFormValues({ ...formValues, intrest: [...formValues.intrest, i] })
                                }
                            }} >
                                <AutocompleteSection showDivider title="Design">
                                    <AutocompleteItem value="2">Flyer Design</AutocompleteItem>
                                    <AutocompleteItem value="3">Web Design</AutocompleteItem>
                                    <AutocompleteItem value="4">Video Editing</AutocompleteItem>
                                    <AutocompleteItem value="11">Photography</AutocompleteItem>
                                    <AutocompleteItem value="12">Content Creating</AutocompleteItem>
                                </AutocompleteSection>
                                <AutocompleteSection showDivider title="Event Management">
                                    <AutocompleteItem value="5">Event Moderating</AutocompleteItem>
                                    <AutocompleteItem value="6">Event Planning</AutocompleteItem>
                                    <AutocompleteItem value="7">Event Coordinating</AutocompleteItem>
                                </AutocompleteSection>
                                <AutocompleteSection showDivider title="Marketing">
                                    <AutocompleteItem value="8">Social Media Marketing</AutocompleteItem>
                                    <AutocompleteItem value="9">Email Marketing</AutocompleteItem>
                                    <AutocompleteItem value="10">Content Marketing</AutocompleteItem>
                                </AutocompleteSection>
                                <AutocompleteSection showDivider title="Leadership">
                                    <AutocompleteItem value="13">Team Leading</AutocompleteItem>
                                    <AutocompleteItem value="14">Project Management</AutocompleteItem>
                                    <AutocompleteItem value="15">Public Speaking</AutocompleteItem>
                                    <AutocompleteItem value="16">Mentoring</AutocompleteItem>
                                    <AutocompleteItem value="17">Coaching</AutocompleteItem>
                                </AutocompleteSection>
                                <AutocompleteSection showDivider title="Technology">
                                    <AutocompleteItem value="18">Web Development</AutocompleteItem>
                                    <AutocompleteItem value="19">App Development</AutocompleteItem>
                                    <AutocompleteItem value="20">Software Development</AutocompleteItem>
                                    <AutocompleteItem value="21">Database Management</AutocompleteItem>
                                    <AutocompleteItem value="22">Networking</AutocompleteItem>
                                    <AutocompleteItem value="23">Cyber Security</AutocompleteItem>
                                    <AutocompleteItem value="24">Cloud Computing</AutocompleteItem>
                                    <AutocompleteItem value="25">AI/ML</AutocompleteItem>
                                    <AutocompleteItem value="26">IoT</AutocompleteItem>
                                    <AutocompleteItem value="27">Blockchain</AutocompleteItem>
                                    <AutocompleteItem value="28">Robotics</AutocompleteItem>
                                    <AutocompleteItem value="29">3D Printing</AutocompleteItem>
                                    <AutocompleteItem value="30">Game Development</AutocompleteItem>
                                </AutocompleteSection>
                                <AutocompleteSection showDivider title="Finance">
                                    <AutocompleteItem value="31">Accounting</AutocompleteItem>
                                    <AutocompleteItem value="32">Financial Planning</AutocompleteItem>
                                </AutocompleteSection>
                                <AutocompleteSection showDivider title="Human Resource">
                                    <AutocompleteItem value="33">Recruitment</AutocompleteItem>
                                    <AutocompleteItem value="34">Training</AutocompleteItem>
                                    <AutocompleteItem value="35">Employee Relations</AutocompleteItem>
                                </AutocompleteSection>
                                <AutocompleteSection showDivider title="Health and Safety">
                                    <AutocompleteItem value="36">First Aid</AutocompleteItem>
                                    <AutocompleteItem value="37">Fire Safety</AutocompleteItem>
                                    <AutocompleteItem value="38">Health and Safety Management</AutocompleteItem>
                                </AutocompleteSection>
                                <AutocompleteSection showDivider title="Legal">
                                    <AutocompleteItem value="39">Contract Management</AutocompleteItem>
                                    <AutocompleteItem value="40">Legal Research</AutocompleteItem>
                                    <AutocompleteItem value="41">Legal Writing</AutocompleteItem>
                                </AutocompleteSection>
                                <AutocompleteSection showDivider title="Education">
                                    <AutocompleteItem value="42">Teaching</AutocompleteItem>
                                    <AutocompleteItem value="43">Tutoring</AutocompleteItem>
                                </AutocompleteSection>
                                <AutocompleteSection title="Others">
                                    <AutocompleteItem value="44">Community Service</AutocompleteItem>
                                    <AutocompleteItem value="45">Fundraising</AutocompleteItem>
                                </AutocompleteSection>
                            </Autocomplete>

                            <div >
                                {
                                    formValues?.intrest?.map((i, index) => (<Chip key={index} color='warning' variant='flat' className="m-1" onClose={() => setFormValues({ ...formValues, intrest: formValues.intrest.filter(item => item !== i) })}>{i}</Chip>))
                                }
                            </div>





                            {/* <div className=" mt-6 w-full flex align-bottom justify-end h-max">
                                            <Button color="warning" className="" variant='flat' onPress={onClose}>
                                                Reset Password
                                            </Button>
                                        </div> */}
                        </div>
                    </div>
                </form>


            </Card>
        </div>
    )
}