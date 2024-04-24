import { Autocomplete, AutocompleteItem, BreadcrumbItem, Breadcrumbs, Button, Card, Chip, Input, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, Pagination, Spinner, Tab, Table, TableBody, TableCell, TableColumn, TableHeader, TableRow, Tabs, Tooltip } from "@nextui-org/react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom"
import supabase from "../supabase/client";
import { lowerize, snake } from "radash";
import { DeleteFilled, RedoOutlined, SearchOutlined, UserAddOutlined, EyeFilled, EditFilled, CopyTwoTone, DeleteTwoTone, EyeTwoTone } from "@ant-design/icons";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { getCustomErrorMsg } from "../util/errorMsg";
import {
    Chart as ChartJs,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Legend,
    Tooltip as ChartTooltip
  } from 'chart.js';
import { Line } from 'react-chartjs-2';

export default () => {

    const { ouID } = useParams();
    const [ou, setOU] = useState({});
   


    const fetchOU = async () => {
        const { data, error } = await supabase.from('ous').select('*,ou_volunteer(*,users(first_name,last_name))').eq('id', ouID);

        if (error) {
            console.log(error);
            return;
        }

        const ou_volunteers = {
            chairman: '',
            secretary: '',
            treasurer: '',
            asst_secretary: ''
        };

        data[0].ou_volunteer.forEach(v => {
            ou_volunteers[v.role.toLowerCase()] = `${v.users.first_name} ${v.users.last_name}`;
        })

        data[0].volunteer = ou_volunteers;

        console.log(data);
        setOU(data[0]);
    }


    useEffect(() => {
        fetchOU();
    }, []);


    return (
        <div className="w-[90%] m-auto">
            <Breadcrumbs className="mt-4">
                <BreadcrumbItem href="../">Home</BreadcrumbItem>
                <BreadcrumbItem href="../ous">Organization Units</BreadcrumbItem>
                <BreadcrumbItem>{ou.short_name}</BreadcrumbItem>
            </Breadcrumbs>

            <Card className="mt-4 p-4">
                <h1 className="text-2xl font-bold">{ou.name} (IEEE-{ou.short_name}-UoJ)</h1>

                <div className="flex justify-between my-4">
                    <div>
                        <h1 className="text-md font-medium">Chairman</h1>
                        <p className="text-gray-500">{ou?.volunteer?.chairman == '' ? <span className="flex justify-center" >-</span> : ou?.volunteer?.chairman}</p>
                    </div>
                    <div>
                        <h1 className="text-md font-medium">Secreatary</h1>
                        <p className="text-gray-500">{ou?.volunteer?.secretary == 0 ? <span className="flex justify-center" >-</span> : ou?.volunteer?.secretary}</p>
                    </div>
                    <div>
                        <h1 className="text-md font-medium">Treasurer</h1>
                        <p className="text-gray-500">{ou?.volunteer?.treasurer == 0 ? <span className="flex justify-center" >-</span> : ou?.volunteer?.treasurer}</p>
                    </div>
                    <div>
                        <h1 className="text-md font-medium">Asst. Secreatary</h1>
                        <p className="text-gray-500">{ou?.volunteer?.assistant_secretary == 0 ? <span className="flex justify-center" >-</span> : ou?.volunteer?.assistant_secretary}</p>
                    </div>
                    <div>
                        <h1 className="text-md font-medium">Vice Chairman</h1>
                        <p className="text-gray-500">{ou?.volunteer?.vice_chairman == 0 ? <span className="flex justify-center" >-</span> : ou?.volunteer?.vice_chairman}</p>
                    </div>
                </div>
            </Card>
            <Tabs className="mt-4">
                <Tab title="Volunteers">
                    <Volunteer ouID={ouID} fetchOU={fetchOU} />
                </Tab>
                <Tab title="Members">
                    <Member ouID={ouID} />
                </Tab>
                <Tab title="Projects">
                    <Project ouID={ouID} />
                </Tab>
                <Tab title="Membership Retention">
                    <MemberCount ouID={ouID} />
                </Tab>
            </Tabs>



        </div>

    )
}

const Member = ({ ouID }) => {

    const [page, setPage] = useState(1);
    const [data, setdata] = useState([]);
    const [totalPageCount, setTotalPageCount] = useState(0);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(false);

    const fetchUsers = () => {
        setLoading(true);
        supabase.from('ou_member').select('*,users!inner(*)')
            .eq('ou_id', ouID)
            .range((page - 1) * 5, page * 5 - 1)
            .then(response => {
                console.log(response)
                getTotalPageCount();
                setdata(response.data);
            }).finally(() => setLoading(false))
    }


    const getTotalPageCount = () => {
        setLoading(true);
        supabase.from('ou_member').select('*,users!inner(*)', { count: 'exact' })
            .eq('ou_id', ouID)
            .then(response => {
                console.log(Math.ceil(response.count / 5))
                setTotalPageCount(Math.ceil(response.count / 5));
            }).finally(() => setLoading(false))

    }

    useEffect(() => {
        fetchUsers();
    }, [page])



    return (
        <Card className="mt-4 p-4">
            <h1 className="text-2xl font-semibold my-2">Members</h1>

            <div className="mt-3">
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
                        loadingContent={<Spinner />}
                        isLoading={loading}
                    >
                        {
                            data.map((user) => (
                                <TableRow>
                                    <TableCell>{user.member_id}</TableCell>
                                    <TableCell>{user.users.first_name}</TableCell>
                                    <TableCell>{user.users.last_name}</TableCell>
                                    <TableCell>{user.users.email_address}</TableCell>
                                    <TableCell >
                                        <Chip className="capitalize m-auto" size="sm" variant="flat" color="success">{user.users.ieee_status ? "Active" : "Inactive"}</Chip>
                                    </TableCell>
                                    <TableCell>
                                        <div className="relative flex items-center gap-2">
                                            <Tooltip content="Copy to Clipboard">
                                                <span className="text-lg text-default-400 cursor-pointer active:opacity-50">
                                                    <CopyTwoTone onClick={() => {
                                                        delete user.users.resetKey;
                                                        navigator.clipboard.writeText(JSON.stringify(user.users));
                                                    }} />
                                                </span>
                                            </Tooltip>

                                        </div>
                                    </TableCell>

                                </TableRow>

                            ))
                        }
                    </TableBody>
                </Table>

            </div>
        </Card>
    )
}

const Volunteer = ({ ouID,fetchOU }) => {

    const [page, setPage] = useState(1);
    const [deleteVolunteer, setDeleteVolunteer] = useState({});
    const [volunteers, setVolunteers] = useState([]);
    const [volunteerList, setVolunteerList] = useState([]);
    const [open, setOpen] = useState(false);
    const [showDialog, setShowDialog] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [dialogLoading, setDialogLoading] = useState(false);
    const [loading,setLoading] = useState(false);
    const [totalPageCount, setTotalPageCount] = useState(0);

    
    const [volunteer, setVolunteer] = useState({
        member_id: '',
        first_name: '',
        last_name: '',
    });

    const searchForVolunteers = async (search) => {
        const { data, error } = await supabase.from('users').select('member_id,first_name,last_name').or(`or(first_name.ilike.%${search}%,last_name.ilike.%${search}%,middle_name.ilike.%${search}%,email_address.ilike.%${search}%')`)
        .range((page - 1) * 5, page * 5 - 1);
        if (error) {
            console.log(error);
            return;
        }
        
        setVolunteerList(data);
    }

   


    const onVolunteerSelection = async (value) => {
        const { data, error } = await supabase.from('users').select('member_id,first_name,last_name').eq('member_id', value);
        if (error) {
            console.log(error);
            return;
        }
        setVolunteer(data[0]);
    }

    const submitVolunteer = async () => {
        setIsSubmitting(true);
        const { data, error } = await supabase.from('ou_volunteer').insert([{
            ou_id: ouID,
            volunteer_id: volunteer.member_id,
            role: volunteer.role
        }]);
        setIsSubmitting(false);
        if (error) {
    
            withReactContent(Swal).fire({
                title: 'Error!',
                text: getCustomErrorMsg(error),
                icon: 'error',
                confirmButtonText: 'OK, got it'
            });
            return;
        }
        fetchVolunteer();
        fetchOU();
        setOpen(false);
        getTotalPageCount();

    }

    const getTotalPageCount = () => {
        setLoading(true);
        supabase.from('ou_volunteer').select('*,users(member_id,first_name,last_name)',{count:'exact'})
            .eq('ou_id', ouID)
            .then(response => {
                console.log(Math.ceil(response.count / 5))
                setTotalPageCount(Math.ceil(response.count / 5));
            }).finally(() => setLoading(false))

    }

    useEffect(() => {
        fetchVolunteer()
    }, [page])

    useEffect(()=>{
        getTotalPageCount();
    
    },[])


    const fetchVolunteer = async () => {
        setLoading(true);
        const { data, error } = await supabase.from('ou_volunteer').select('*,users(member_id,first_name,last_name)')
        .eq('ou_id', ouID)
        .range((page - 1) * 5, page * 5 - 1);
        setLoading(false);
        if (error) {
            console.log(error);
            return;
        }
        setVolunteers(data);
    }

    return (
        <>
            <Card className="mt-4 p-4">
                <div className="grid grid-cols-2 mb-2">
                    <div className="flex items-center">
                        <h1 className="text-2xl font-bold ">Volunteers</h1>
                    </div>

                    <div className="flex justify-end">
                        <Button className="mx-2 my-2" color="primary" variant="solid" radius="sm" endContent={<UserAddOutlined />} onClick={() => setOpen(true)}>
                            Assign Volunteer
                        </Button>
                    </div>
                </div>
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
                        <TableColumn>Member ID</TableColumn>
                        <TableColumn>First Name</TableColumn>
                        <TableColumn>Last Name</TableColumn>
                        <TableColumn>Role</TableColumn>
                        <TableColumn>Actions</TableColumn>
                    </TableHeader>
                    <TableBody
                        loadingContent={<Spinner />}
                        isLoading={loading}
                    
                    >
                        {
                            volunteers?.map((volunteer, index) => (
                                <TableRow key={index}>
                                    <TableCell>{volunteer.users.member_id}</TableCell>
                                    <TableCell>{volunteer.users.first_name}</TableCell>
                                    <TableCell>{volunteer.users.last_name}</TableCell>
                                    <TableCell>
                                        <Chip color="warning" variant="flat" >{volunteer.role.split('_').join(' ')}</Chip>
                                    </TableCell>
                                    <TableCell>
                                        <Tooltip content="Dissociate Volunteer">
                                            <span className="text-lg text-danger cursor-pointer active:opacity-50">
                                                <DeleteTwoTone
                                                    onClick={() => {
                                                        setDeleteVolunteer(
                                                            {
                                                                member_id: volunteer.users.member_id,
                                                                first_name: volunteer.users.first_name,
                                                                last_name: volunteer.users.last_name,
                                                                role: volunteer.role
                                                            }

                                                        );
                                                        setShowDialog(true);
                                                    }}

                                                />
                                            </span>
                                        </Tooltip>
                                    </TableCell>
                                </TableRow>
                            ))
                        }

                    </TableBody>
                </Table>

            </Card>
            <Modal
                size='xl'
                isOpen={open}
                onClose={() => setOpen(false)}
            >
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader className="flex flex-col gap-1">Assign Volunteer</ModalHeader>
                            <ModalBody>
                                <form>
                                    <Autocomplete
                                        className="my-2"
                                        placeholder="Type to search..."

                                        onInputChange={searchForVolunteers}
                                        items={volunteerList}
                                        onSelectionChange={onVolunteerSelection}
                                    >
                                        {
                                            (item) => <AutocompleteItem key={item.member_id} value={item.member_id}>{item.member_id} - {item.first_name} {item.last_name}</AutocompleteItem>
                                        }

                                    </Autocomplete>
                                    <Input className="my-2" label="First Name" disabled placeholder="First Name" value={volunteer.first_name} />
                                    <Input className="my-2" label="Last Name" disabled placeholder="Last Name" value={volunteer.last_name} />
                                    <Autocomplete label="Role" allowsCustomValue className="my-2" placeholder="Select Role" onInputChange={role => setVolunteer({ ...volunteer, role: snake(role).toUpperCase() })}>
                                        <AutocompleteItem value="Chairman">Chairman</AutocompleteItem>
                                        <AutocompleteItem value="Secretary">Secretary</AutocompleteItem>
                                        <AutocompleteItem value="Treasurer">Treasurer</AutocompleteItem>
                                        <AutocompleteItem value="Asst_Secretary">Assistant Secretary</AutocompleteItem>
                                        <AutocompleteItem value="Vice_Chairman">Vice Chairman</AutocompleteItem>


                                    </Autocomplete>

                                </form>
                            </ModalBody>
                            <ModalFooter>
                                <Button isLoading={isSubmitting} color="primary" variant='flat' onClick={submitVolunteer}>
                                    Assign the Volunteer
                                </Button>

                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>
            <Modal
                size='xl'
                isOpen={showDialog}
                onClose={() => setShowDialog(false)}
            >
                <ModalContent>
                    {
                        (onClose) => (
                            <>
                                <ModalHeader className="flex flex-col gap-1">Dissociate Volunteer</ModalHeader>
                                <ModalBody>
                                    <p className="text-gray-500">Are you sure you want to dissociate <span className="font-semibold">{deleteVolunteer.first_name} {deleteVolunteer.last_name}</span> from the project?</p>
                                </ModalBody>
                                <ModalFooter>
                                    <Button isLoading={dialogLoading} color="danger" variant='flat' onClick={async () => {
                                        setDialogLoading(true)
                                        const { data, error } = await supabase.from('ou_volunteer').delete().eq('ou_id', ouID).eq('volunteer_id', deleteVolunteer.member_id);
                                        if (error) {
                                            console.log(error);
                                            return;
                                        }
                                        setShowDialog(false);
                                        fetchVolunteer()
                                        fetchOU();
                                        setDialogLoading(false);
                                        setPage(1);
                                        getTotalPageCount();
                                    }} >
                                        Dissociate
                                    </Button>
                                    <Button color="primary" variant='flat' onClick={() => setShowDialog(false)} >
                                        Cancel
                                    </Button>
                                </ModalFooter>
                            </>
                        )
                    }
                </ModalContent>
            </Modal>

        </>
    )
}

const MemberCount = ({ ouID }) => {

    const [labels, setLabels] = useState([]);
    const [dataset, setDataset] = useState([]);

    useEffect(() => {
        fetchMemberRetain();
    }, []);

    const fetchMemberRetain = async () => {
        const {data,error} = await supabase.from('ou_member_count').select('*',{count:'exact'}).eq('ou_id',ouID);

        const labels = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

        setLabels(labels);
        const d = []
        setDataset(labels.map(month=>data.find(d=>d.month.split(' ').join('')==month)?.count || null));
        if(error){
            console.log(error);
            return;
        }
        console.log(data);

    }


    ChartJs.register(
        CategoryScale,
        LinearScale,
        PointElement,
        LineElement,
        Title,
        ChartTooltip,
        Legend
      );


    const options = {
        responsive: true,
        plugins: {
            legend: {
                
                position: 'top',
            },
            title: {
                display: false,
            },
        },
        scales: {
            x: {
              border: {
                display: true
              },
              grid: {
                display: false,
                drawOnChartArea: false,
                drawTicks: true,
              }
            },
            y: {
              border: {
                display: true
              },
              grid: {
                display:false,
              },
            }
        }      
    };

    

    const data = {
        labels,
        datasets: [
          {
            label: 'Membership Count',
            data: dataset,
            borderColor: 'rgb(255, 99, 132)',
            backgroundColor: 'rgba(255, 99, 132, 0.5)',
          },
        ]
    }

    return (
        <Card className="mt-4 p-4">
            <h1 className="text-2xl font-semibold my-2">Membership Retention</h1>
            <Line data={data} options={options} />
        </Card>
    )

}

const Project = ({ ouID }) => {

    const [projects, setProjects] = useState([]);
    const navigate = useNavigate();

    const fetchProjects = async () => {
        const { data, error } = await supabase.from('ou_project').select('ou_id,...projects(*)').eq('ou_id', ouID);
        if (error) {
            console.log(error);
            return;
        }
        console.log(data);
        setProjects(data);
    }

    useEffect(() => {
        fetchProjects();
    }, []);

    return (
        <Card className="mt-4 p-4">
            <h1 className="text-2xl font-semibold my-2">Projects</h1>
            <Table>
                <TableHeader>
                    <TableColumn>Project ID</TableColumn>
                    <TableColumn>Project Name</TableColumn>
                    <TableColumn>Project Type</TableColumn>
                    <TableColumn>Project Status</TableColumn>
                    <TableColumn>Actions</TableColumn>
                </TableHeader>
                <TableBody>
                    {
                        projects.map((project) => (
                            <TableRow>
                                <TableCell>{project.id}</TableCell>
                                <TableCell>{project.name}</TableCell>
                                <TableCell>{project.type}</TableCell>
                                <TableCell>
                                    <Chip color={project.active ? "success" : "error"} variant="flat">{project.active ? "Active" : "Inactive"}</Chip>
                                </TableCell>
                                <TableCell>
                                    <div className="relative flex items-center gap-2">
                                        <Tooltip content="View Project">
                                            <span className="text-lg text-default-400 cursor-pointer active:opacity-50">
                                                <EyeTwoTone onClick={()=>navigate(`/dashboard/dashboard/projects/${project.id}`)} />
                                            </span>
                                        </Tooltip>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))
                    }
                </TableBody>
            </Table>
        </Card>
    )


}