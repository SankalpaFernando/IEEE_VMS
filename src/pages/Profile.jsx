import { Autocomplete, AutocompleteItem, AutocompleteSection, BreadcrumbItem, Breadcrumbs, Button, Card, Chip, Input, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, Progress } from "@nextui-org/react"
import { useUserStore } from "../util/store"
import { useEffect, useState } from "react"
import Swal from "sweetalert2"
import supabase from "../supabase/client"
import { EyeFilled, EyeInvisibleFilled } from "@ant-design/icons"
import { calculatePasswordStrength, getPasswordStrengthColor } from "../util/util"
import { set } from "radash"

export default () => {

    const user = useUserStore(state => state.user);
    const fetchUser = useUserStore(state => state.fetchUser);

    const [isLoading, setIsLoading] = useState(false);
    const [isVisible, setIsVisible] = useState(false);
    const [showProgress, setShowProgress] = useState(false);
    const [error, setError] = useState({
        passwordMsg: ''
    })
    const [formPassword, setFormPassword] = useState({
        password: '',
        confirm_password: ''
    })
    const [open, setOpen] = useState(false);


    const [formValues, setFormValues] = useState({
        first_name: '',
        last_name: '',
        middle_name: '',
        gender: '',
        email_address: '',
        address: '',
        program: '',
        graduation_date: '',
        renew_year: '',
        degree: '',
        intrest: []
    })

    const getUserInfo = async () => {

        setFormValues({
            first_name: user.first_name,
            last_name: user.last_name,
            middle_name: user.middle_name,
            gender: user.gender,
            email_address: user.email_address,
            address: user.address,
            program: user.program,
            graduation_date: user.graduation_date,
            renew_year: user.renew_year,
            degree: user.degree,
            intrest: user.intrest
        })


    }
    const resetPassword = async () => {

        if (calculatePasswordStrength(formPassword.password) < 80) {
            setError({
                passwordMsg: "Password is too weak"
            });
            return;
        }
        if (formPassword.password !== formPassword.confirm_password) {
            setError({ passwordMsg: "Password does not match" });
            return;
        }

        setIsLoading(true)
        supabase.auth.updateUser({
            password: formPassword.password
        }).then((res) => {
            Swal.fire({
                title: 'Password Reset',
                text: 'Password has been reset successfully',
                icon: 'success',
                confirmButtonText: 'Ok'
            }).then(() => {
                setOpen(false)
                supabase.auth.signOut()
                window.location.reload();
            })
        }).catch((error) => {
            Swal.fire({
                title: 'Error',
                text: error.message,
                icon: 'error',
                confirmButtonText: 'Ok'
            })
        })
        setIsLoading(false)

        

    }

    const updateUser = async () => {
        setIsLoading(true)
        const { data, error } = await supabase.from('users').update({
            intrest: formValues.intrest
        }).eq('member_id', user.member_id)
        setIsLoading(false)
        if (error) {
            console.log(error)
            return;
        }

        Swal.fire({
            title: 'Profile Updated',
            text: 'Your profile has been updated successfully',
            icon: 'success',
            confirmButtonText: 'Ok'
        })

        fetchUser()

    }

    const handleChange = (e) => {
        formPassword[e.target.name] = e.target.value;
        setFormPassword({ ...formPassword });

    }

    useEffect(() => {
        getUserInfo()
    }, [])


    return (
        <div className="w-[90%] m-auto">
            <Breadcrumbs className="mt-4">
                <BreadcrumbItem href="../">Home</BreadcrumbItem>
                <BreadcrumbItem href="../ous">Profile</BreadcrumbItem>
            </Breadcrumbs>

            <Card className="mt-4 p-4">
                <h1 className="text-2xl font-semibold my-2">Profile</h1>

                <div className="mt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <Input variant='faded' className="my-3" label="First Name" placeholder="Enter your first name" disabled value={formValues.first_name} />
                            <Input variant='faded' className="my-3" label="Last Name" placeholder="Enter your last name" disabled value={formValues.last_name} />
                            <Input variant='faded' className="my-3" label="Middle Name" placeholder="Enter your middle name" disabled value={formValues.middle_name} />
                            <Input variant='faded' className="my-3" label="Email" placeholder="Enter your email" disabled value={formValues.email_address} />
                            <Input variant='faded' label="Gender" className="my-3" placeholder="Enter your Gender" disabled value={formValues.gender} />
                        </div>
                        <div>
                            <Input variant='faded' label="Address" className="my-3" disabled value={formValues.address} />
                            <Input variant='faded' label="Program" className="my-3" disabled value={formValues.program} />
                            <Input variant='faded' label="Graduation Date" className="my-3" disabled value={formValues.graduation_date} />
                            <Input variant='faded' label="Renew Year" className="my-3" disabled value={formValues.renew_year} />
                            <Input variant='faded' label="Degree" className="my-3" disabled value={formValues.degree} />
                        </div>
                    </div>
                </div>


                <div className="">
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
                </div>

                <div className="flex items-end justify-end">
                    <Button color="primary" isLoading={isLoading} onClick={updateUser} className="mt-4" variant="solid">Update Profile</Button>
                    <Button
                        color="primary"
                        className="mt-4 ml-2"
                        variant="bordered"
                        onClick={() => {
                            setOpen(true)
                        }}
                    >Reset Password</Button>
                </div>


            </Card>
            <Modal isOpen={open}>
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader className="flex flex-col gap-1">Project Details</ModalHeader>
                            <ModalBody>
                                <Input variant='bordered' name="password" label="Password" className="mt-2"
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


                                {showProgress && (<div className="w-[95%] mx-auto" >
                                    <Progress size="sm" color={getPasswordStrengthColor(calculatePasswordStrength(formPassword.password))} value={calculatePasswordStrength(formPassword.password)} />
                                </div >)}
                                {
                                    error.passwordMsg && <p className="text-danger text-sm">{error.passwordMsg}</p>
                                }


                                <Input variant='bordered' name="confirm_password" label="Confirm Password" className="my-0"
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

                            </ModalBody>
                            <ModalFooter>
                                <Button color="error" onClick={() => setOpen(false)} variant="solid">Cancel</Button>
                                <Button color="primary" isLoading={isLoading} onClick={resetPassword} variant="solid">Reset Password</Button>
                            </ModalFooter>
                        </>)}
                </ModalContent>
            </Modal>
        </div>
    )
}