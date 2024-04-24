import { ApiTwoTone, CiCircleOutlined, DeleteFilled, DeleteTwoTone, DropboxOutlined, EditFilled, EditTwoTone, EyeFilled, EyeTwoTone, RedoOutlined, SearchOutlined, StarOutlined, UserAddOutlined } from "@ant-design/icons";
import { Breadcrumbs, BreadcrumbItem, Card, Input, Button, Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Chip, Tooltip, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Pagination, Spinner, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, DropdownSection, Select, SelectItem, Autocomplete, AutocompleteSection, AutocompleteItem, } from "@nextui-org/react";
import supabase from "../supabase/client";
import { useEffect, useState } from "react";
import { getUserAccess, getUserAuth } from "../util/auth";
import { useUserStore } from "../util/store";
import { title } from "radash";


export default () => {

    const [data, setdata] = useState([]);
    const [page, setPage] = useState(1);
    const [totalPageCount, setTotalPageCount] = useState(0);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);
    const [volunteerOpen, setVolunteerOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [access, setAccess] = useState({
        view: false,
        edit: false,
        delete: false
    });

    const userDetails = useUserStore(state => state.user);

    useEffect(() => {
        setAccess({
            view: getUserAccess(userDetails, ["GENERAL"], []),
            edit: getUserAccess(userDetails, [], [{ ou_id: 1, role: "CHAIRMAN" }]),
            delete: getUserAccess(userDetails, [], [{ ou_id: 1, role: "CHAIRMAN" }])
        });
    }, [userDetails])


    const handleSearch = (e) => {
        setSearch(e.target.value);
        setPage(1);
    }

    const fetchUsers = () => {
        setLoading(true);

        supabase.from('users').select('*')
            .or(`or(first_name.ilike.%${search}%,last_name.ilike.%${search}%,middle_name.ilike.%${search}%,email_address.ilike.%${search}%')`)
            .range((page - 1) * 10, page * 10 - 1)
            .then(response => {
                getTotalPageCount();
                setdata(response.data);
            }).finally(() => setLoading(false))
    }


    const getTotalPageCount = () => {
        setLoading(true);
        supabase.from('users').select('*', { count: 'exact' })
            .or(`or(first_name.ilike.%${search}%,last_name.ilike.%${search}%,middle_name.ilike.%${search}%,email_address.ilike.%${search}%')`)

            .then(response => {
                setTotalPageCount(Math.ceil(response.count / 10));
            }).finally(() => setLoading(false))

    }



    useEffect(() => {
        fetchUsers();
    }, [page])

    useEffect(() => {
        fetchUsers();
    }, [search])



    useEffect(() => {
        getTotalPageCount();
        console.log(getUserAuth())
    }, []);



    const [selectedSection, setSelectedSection] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState(null);

    const sections = [
        {
            title: "Design",
            categories: ["Flyer Design", "Web Design", "Video Editing", "Photography", "Content Creating"]
        },
        {
            title: "Event Management",
            categories: ["Event Moderating", "Event Planning", "Event Coordinating"]
        },
        {
            title: "Marketing",
            categories: ["Social Media Marketing", "Email Marketing", "Content Marketing"]
        },
        {
            title: "Leadership",
            categories: ["Team Leading", "Project Management", "Public Speaking", "Mentoring", "Coaching"]
        },
        {
            title: "Technology",
            categories: ["Web Development", "App Development", "Software Development", "Database Management", "Networking", "Cyber Security", "Cloud Computing", "AI/ML", "IoT", "Blockchain", "Robotics", "3D Printing", "Game Development"]
        },
        {
            title: "Finance",
            categories: ["Accounting", "Financial Planning"]
        },
        {
            title: "Human Resource",
            categories: ["Recruitment", "Training", "Employee Relations"]
        },
        {
            title: "Health and Safety",
            categories: ["First Aid", "Fire Safety", "Health and Safety Management"]
        },
        {
            title: "Legal",
            categories: ["Contract Management", "Legal Research", "Legal Writing"]
        },
        {
            title: "Education",
            categories: ["Teaching", "Tutoring"]
        },
        {
            title: "Others",
            categories: ["Community Service", "Fundraising"]
        }
    ];

    return (
        <div className="w-[90%] m-auto">
            <Breadcrumbs className="mt-4">
                <BreadcrumbItem href="/">Home</BreadcrumbItem>
                <BreadcrumbItem href="/volunteer">Volunteer</BreadcrumbItem>
            </Breadcrumbs>
            <Card className="mt-4 p-4">
                <h1 className="text-2xl font-semibold my-2">Volunteer</h1>
                <div className="grid mb-2" style={{ gridTemplateColumns: '4fr 2fr 1fr' }}>
                    <div className="flex items-center my-3">
                        <Input

                            placeholder="Type to search..."
                            size="sm"
                            startContent={<SearchOutlined size={18} />}
                            type="search"
                            onChange={handleSearch}
                        />
                    </div>
                    <div className="flex items-center">
                        <Autocomplete
                            label="Expert Area" className="mx-2" placeholder="Select one or more option(s)" variant="bordered" onInputChange={i => {

                                setLoading(true);
                                supabase.from('users').select('*')
                                    .or(`or(first_name.ilike.%${search}%,last_name.ilike.%${search}%,middle_name.ilike.%${search}%,email_address.ilike.%${search}%')`)
                                    .contains('intrest', [i])

                                    .then(response => {
                                        setTotalPageCount(-1)
                                        setdata(response.data);
                                    }).finally(() => setLoading(false))


                            }}
                            size="sm"
                        >
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
                    </div>
                    <div className="flex items-center">
                        {/* <Button className="mx-2" color="primary" variant="solid" radius="sm" endContent={<UserAddOutlined />}>
                            Add Volunteer
                        </Button> */}
                        <Button className="mx-2 w-full" color="primary" variant="bordered" radius="sm" endContent={<RedoOutlined />} onClick={() => {
                            setSearch("");
                        }}>
                            Refresh
                        </Button>
                    </div>
                </div>
                <div>
                    <Table

                        bottomContent={
                            totalPageCount > 0 ? (
                                <div className="flex w-full justify-center">
                                    <Pagination
                                        isCompact
                                        showControls
                                        showShadow
                                        color="primary"
                                        page={page}
                                        total={totalPageCount}
                                        onChange={(p) => setPage(p)}
                                    />
                                </div>
                            ) : null
                        }

                    >
                        <TableHeader>
                            <TableColumn>Memeber ID</TableColumn>
                            <TableColumn>First Name</TableColumn>
                            <TableColumn>Last Name</TableColumn>
                            <TableColumn>Email</TableColumn>
                            <TableColumn align="center">Membership Status</TableColumn>
                            <TableColumn>Actions</TableColumn>
                        </TableHeader>
                        <TableBody
                            emptyContent={"No records to display."}
                            loadingContent={<Spinner />}
                            isLoading={loading}
                        >
                            {
                                data && data.map((user) => (
                                    <TableRow>
                                        <TableCell>{user.member_id}</TableCell>
                                        <TableCell>{user.first_name}</TableCell>
                                        <TableCell>{user.last_name}</TableCell>
                                        <TableCell>{user.email_address}</TableCell>
                                        <TableCell >
                                            <Chip className="capitalize m-auto" size="sm" variant="flat" color="success">{user.ieee_status ? "Active" : "Inactive"}</Chip>
                                        </TableCell>
                                        <TableCell>
                                            <div className="relative flex items-center gap-2">
                                                <Tooltip content="Details">
                                                    <span className="text-lg text-default-400 cursor-pointer active:opacity-50">
                                                        <EyeTwoTone onClick={() => {
                                                            setOpen(true);
                                                            setSelectedUser(user);
                                                        }} />
                                                    </span>
                                                </Tooltip>
                                                <Tooltip content="Volunteer Details">
                                                    <span className="text-lg text-default-400 cursor-pointer active:opacity-50">
                                                        <ApiTwoTone onClick={() => {
                                                            setVolunteerOpen(true);
                                                            setSelectedUser(user);
                                                        }} />
                                                    </span>
                                                </Tooltip>

                                                <>
                                                    {
                                                        access.edit &&
                                                        <Tooltip content="Edit user">
                                                            <span className="text-lg text-warning cursor-pointer active:opacity-50">
                                                                <EditTwoTone />
                                                            </span>
                                                        </Tooltip>
                                                    }
                                                    {
                                                        access.delete &&
                                                        <Tooltip content="Delete user">
                                                            <span className="text-lg text-danger cursor-pointer active:opacity-50">
                                                                <DeleteTwoTone />
                                                            </span>
                                                        </Tooltip>
                                                    }

                                                </>


                                            </div>
                                        </TableCell>

                                    </TableRow>

                                ))
                            }
                        </TableBody>
                    </Table>

                </div>
            </Card>
            <ModalComponent open={open} setOpen={(o) => setOpen(o)} selectedUser={selectedUser} />
            <VolunteerComponent open={volunteerOpen} setOpen={(o) => setVolunteerOpen(o)} selectedUser={selectedUser} />

        </div>
    )
}

const VolunteerComponent = ({ open, setOpen, selectedUser }) => {

    const [volunteerOus, setVolunteerOus] = useState([]);
    const [volunteerProjects, setVolunteerProjects] = useState([]);

    const getVolunteerDetails = () => {

        if (!selectedUser) return;

        supabase.from('volunteer_project')
            .select('*,projects(*)')
            .eq('volunteer_id', selectedUser.member_id)
            .then(response => {
                console.log(response.data)
                setVolunteerProjects(response.data);
            })
        
        supabase.from('ou_volunteer')
            .select('*,ous(*)')
            .eq('volunteer_id', selectedUser.member_id)
            .then(response => {
                console.log(response.data)
                setVolunteerOus(response.data);
            })
    }

    useEffect(() => {
        getVolunteerDetails();
    }, [selectedUser])

    return (
        <Modal
            size='lg'
            isOpen={open}
            onClose={() => setOpen(false)}
        >
            <ModalContent>
                {
                    (onClose) => (
                        <>
                            <ModalHeader className="flex flex-col gap-1"> {selectedUser.first_name}'s Volunteering Details</ModalHeader>
                            <ModalBody>
                                <div className="">
                                    <h2 className="text-xl font-semibold my-1 mb-3">Projects</h2>
                                    {
                                        volunteerProjects && volunteerProjects.map((volunteer) => (
                                            <div className="grid gap-2  grid-cols-2 my-2">
                                                <div className="flex flex-col">
                                                    <span className="text-lg">{volunteer.role}</span>
                                                    <span className="text-tiny text-default-400">{volunteer.projects.name}</span>
                                                </div>

                                                <div className="flex justify-end items-start">
                                                    {
                                                        volunteer.score==null ? <Chip color="warning" variant="flat">Pending</Chip> : <div className="flex justify-center items-center gap-2"> <StarOutlined style={{color:"#ffc329"}} />  {volunteer.score}</div>
                                                    }
                                                </div>
                                            </div>))
                                    }
                                </div>
                                <div className="">
                                <h2 className="text-xl font-semibold my-1 mb-3">Organisational Units</h2>
                                    {
                                        volunteerOus && volunteerOus.map((project) => (
                                            <div className="grid gap-2  grid-cols-2 my-2">
                                            <div className="flex flex-col">
                                                <span className="text-lg">{title(project.role.replace("_"," ").toLowerCase())}</span>
                                                <span className="text-tiny text-default-400">{project.ous.name}</span>
                                            </div>

                                           
                                        </div>    
                                        
                                        ))
                                    }
                                </div>

                            </ModalBody>
                        </>

                    )
                }
            </ModalContent>
        </Modal>
    )
}


const ModalComponent = ({ open, setOpen, selectedUser }) => {

    const onClose = () => setOpen(false);

    return (
        <Modal
            size='5xl'
            isOpen={open}
            onClose={onClose}
        >
            <ModalContent>
                {(onClose) => (
                    <>
                        <ModalHeader className="flex flex-col gap-1">Volunteer {selectedUser.first_name}'s Details</ModalHeader>
                        <ModalBody>
                            <form>
                                <div className="grid grid-cols-3 gap-2">
                                    <div className=" gap-2">
                                        <Input variant='faded' value={selectedUser.member_id} label="Member ID" className="my-2" />
                                        <Input variant='faded' value={selectedUser.first_name} label="First Name" className="my-2" />
                                        <Input variant='faded' value={selectedUser.middle_name} label="Middle Name" className="my-2" />
                                        <Input variant='faded' value={selectedUser.last_name} label="Last Name" className="my-2" />
                                        <Input variant='faded' value={selectedUser.email_address} label="Email" className="my-2" />
                                    </div>
                                    <div>
                                        <Input variant='faded' value={selectedUser.ieee_status ? "Active" : "Inactive"} label="Membership Status" className="my-2" />
                                        <Input variant='faded' value={selectedUser.gender} label="Gender" className="my-2" />
                                        <Input variant='faded' value={selectedUser.address} label="Address" className="my-2" />
                                        <Input variant='faded' value={selectedUser.program} label="Program" className="my-2" />
                                        <Input variant='faded' value={selectedUser.graduation_date} label="Graduation Date" className="my-2" />
                                    </div>
                                    <div className=" gap-2">
                                        <Input variant='faded' value={selectedUser.renew_year} label="Renew Year" className="my-2" />
                                        <Input variant='faded' value={selectedUser.degree} label="Degree" className="my-2" />
                                        <Input variant='faded' value={selectedUser.membership_type} label="Membership Type" className="my-2" />

                                        {
                                            selectedUser.intrest && selectedUser.intrest.length > 0 &&
                                            <div>
                                                <label className="text-default-500">Expert Area</label>
                                                <div className="flex flex-wrap gap-2 mt-2">
                                                    {
                                                        selectedUser.intrest.map((i) => (
                                                            <Chip key={i} color="success" variant="flat">{i}</Chip>
                                                        ))
                                                    }
                                                </div>
                                            </div>
                                        }
                                        {/* <div className=" mt-6 w-full flex align-bottom justify-end h-max">
                                            <Button color="warning" className="" variant='flat' onPress={onClose}>
                                                Reset Password
                                            </Button>
                                        </div> */}
                                    </div>

                                </div>



                            </form>
                        </ModalBody>
                        <ModalFooter>
                            {/* <Button  color="danger" variant='flat' onPress={onClose}>
                                Close
                            </Button> */}

                        </ModalFooter>
                    </>
                )}
            </ModalContent>
        </Modal>
    )
}