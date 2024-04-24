import { DeleteFilled, DeleteOutlined, HeartFilled, PlayCircleOutlined, RedoOutlined, SaveOutlined, SendOutlined, StarFilled, UserAddOutlined } from "@ant-design/icons"
import { Autocomplete, AutocompleteItem, AutocompleteSection, BreadcrumbItem, Breadcrumbs, Button, Card, Chip, Input, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, Select, SelectItem, Table, TableBody, TableCell, TableColumn, TableHeader, TableRow, Tabs, Tooltip, Tab, Radio, RadioGroup, Dropdown, Textarea, Slider } from "@nextui-org/react"
import { useAsyncList } from "@react-stately/data";
import { useEffect, useState } from "react";
import supabase from "../supabase/client";
import { useParams } from "react-router-dom";
import { useQuery } from "react-query";
import { useUserStore } from "../util/store";
import Swal from "sweetalert2";
import { getMonthName, getScorePointsForProjectType, getMonthsBetweenDates} from "../util/util";
import { SlAlert } from "@shoelace-style/shoelace";


export default () => {

    const [open, setOpen] = useState(false);
    const [volunteerList, setVolunteerList] = useState([]);
    const [project, setProject] = useState({
        name: '',
        type: '',
        ous: [],
        project_leads: [],
        project_supervisors: []
    });
    const [submitting, setSubmitting] = useState(false);
    const [showDialog, setShowDialog] = useState(false);
    const [deleteVolunteer, setDeleteVolunteer] = useState({
        member_id: '',
        first_name: '',
        last_name: '',
        role: ''
    });


    const fetchVolunteers = async () => {
        const { data, error } = await supabase.from('volunteer_project').select('users(member_id,first_name,last_name),role').eq('project_id', projectID)
        if (error) {
            console.log(error);
            return;
        }
        return data;
    }

    const { isLoading, refetch, data: projectVolunteer } = useQuery('volunteers', fetchVolunteers);

    const { projectID } = useParams();

    const [volunteer, setVolunteer] = useState({
        member_id: '',
        first_name: '',
        last_name: '',
    });

    const searchForVolunteers = async (search) => {
        const { data, error } = await supabase.from('users').select('member_id,first_name,last_name').or(`or(first_name.ilike.%${search}%,last_name.ilike.%${search}%,middle_name.ilike.%${search}%,email_address.ilike.%${search}%')`).range(0, 10);
        if (error) {
            console.log(error);
            return;
        }
        console.log(data);
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

    const assignVolunteer = async () => {
        setSubmitting(true);
        const { data, error } = await supabase.from('volunteer_project').insert(
            {
                project_id: projectID,
                volunteer_id: volunteer.member_id,
                role: volunteer.role
            }
        );
        if (error) {
            console.log(error);
            return;
        }
        setOpen(false);
        setSubmitting(false);
        refetch();
        detailRefetch();
    }

    const detailRefetch = async () => {
        const { data, error } = await supabase.from('projects').select('name,type,ous(*),description').eq('id', projectID);
        if (error) {
            console.log(error);
            return;
        }
        const { data: vDetails, errorDetails } = await supabase.from('volunteer_project').select('users(member_id,first_name,last_name),role').eq('project_id', projectID).eq('role', 'Project Lead');

        const { data: supervisorDetails, errorSup } = await supabase.from('volunteer_project').select('users(member_id,first_name,last_name),role').eq('project_id', projectID).eq('role', 'Project Supervisor');

        setProject({ ...data[0], project_leads: vDetails, project_supervisors: supervisorDetails });
        refetch();
    }

    useEffect(() => {
        detailRefetch();
    }, [])



    return (
        <div className="w-[90%] m-auto">
            <Breadcrumbs className="mt-4">
                <BreadcrumbItem href="../">Home</BreadcrumbItem>
                <BreadcrumbItem href="../projects">Projects</BreadcrumbItem>
                <BreadcrumbItem>{project.name}</BreadcrumbItem>
            </Breadcrumbs>

            <Card className="mt-4 p-4">
                <h1 className="text-2xl font-bold">{project.name}</h1>
                <p className="text-gray-500 my-2">{project.description}</p>

                <div className="flex justify-between my-3">
                    <div>
                        <h1 className="text-md font-medium">Project Type</h1>
                        <p className="text-gray-500">{project.type == '' ? <span className="flex justify-center" >-</span> : project.type}</p>
                    </div>
                    <div>
                        <h1 className="text-md font-medium">Organisational Unit(s)</h1>
                        <p className="text-gray-500">{project?.ous.length == 0 ? <span className="flex justify-center" >-</span> : project?.ous?.map(ou => ou.short_name).join(", ")}</p>
                    </div>
                    <div>
                        <h1 className="text-md font-medium">Project Lead</h1>
                        <p className="text-gray-500">{project?.project_leads.length == 0 ? <span className="flex justify-center" >-</span> : project?.project_leads.map(({ users }) => users.first_name + ' ' + users.last_name).join(', ')}</p>
                    </div>
                    <div>
                        <h1 className="text-md font-medium">Project Supervisor</h1>
                        <p className="text-gray-500">{project?.project_supervisors.length == 0 ? <span className="flex justify-center" >-</span> : project.project_supervisors.map(({ users }) => users.first_name + ' ' + users.last_name).join(', ')}</p>
                    </div>
                </div>
            </Card>

            <Tabs className="mt-4">
                <Tab title="Volunteers">
                    <Card className="mt-4 p-4">
                        <div className="grid grid-cols-2 mb-2">
                            <div className="flex items-center">
                                <h1 className="text-2xl font-bold ">Volunteers of The Project</h1>
                            </div>

                            <div className="flex justify-end">
                                <Button className="mx-2 my-2" color="primary" variant="solid" radius="sm" endContent={<UserAddOutlined />} onClick={setOpen}>
                                    Assign Volunteer
                                </Button>
                            </div>
                        </div>
                        <Table>
                            <TableHeader>
                                <TableColumn>Member ID</TableColumn>
                                <TableColumn>First Name</TableColumn>
                                <TableColumn>Last Name</TableColumn>
                                <TableColumn>Role</TableColumn>
                                <TableColumn>Actions</TableColumn>
                            </TableHeader>
                            <TableBody>
                                {
                                    projectVolunteer?.map((volunteer, index) => (
                                        <TableRow key={index}>
                                            <TableCell>{volunteer.users.member_id}</TableCell>
                                            <TableCell>{volunteer.users.first_name}</TableCell>
                                            <TableCell>{volunteer.users.last_name}</TableCell>
                                            <TableCell>
                                                <Chip color="success" variant="flat" >{volunteer.role}</Chip>
                                            </TableCell>
                                            <TableCell>
                                                <Tooltip color="danger" content="Dissociate Volunteer">
                                                    <span className="text-lg text-danger cursor-pointer active:opacity-50">
                                                        <DeleteFilled onClick={() => {
                                                            setDeleteVolunteer(
                                                                {
                                                                    member_id: volunteer.users.member_id,
                                                                    first_name: volunteer.users.first_name,
                                                                    last_name: volunteer.users.last_name,
                                                                    role: volunteer.role
                                                                }

                                                            );
                                                            setShowDialog(true);
                                                        }} />
                                                    </span>
                                                </Tooltip>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                }

                            </TableBody>
                        </Table>

                    </Card>
                </Tab>
                <Tab title="Evaluation">
                    <Evaluation projectID={projectID} />
                </Tab>
                <Tab title="Settings">
                    <Settings projectID={projectID} />
                </Tab>
            </Tabs>
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
                                    <Button color="danger" variant='flat' onClick={async () => {
                                        const { data, error } = await supabase.from('volunteer_project').delete().eq('volunteer_id', deleteVolunteer.member_id).eq('project_id', projectID).eq('role', deleteVolunteer.role);
                                        if (error) {
                                            console.log(error);
                                            return;
                                        }
                                        setShowDialog(false);
                                        refetch();
                                        detailRefetch();
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
                                    <Autocomplete label="Role" allowsCustomValue className="my-2" placeholder="Select Role" onInputChange={role => setVolunteer({ ...volunteer, role })}>
                                        <AutocompleteSection title="General">
                                            <AutocompleteItem value="project_lead">Project Lead</AutocompleteItem>
                                            <AutocompleteItem value="project_supervisor">Project Supervisor</AutocompleteItem>
                                            <AutocompleteItem value="co_lead">Project Co-Lead</AutocompleteItem>
                                            <AutocompleteItem value="g_chair">Generel Chair</AutocompleteItem>
                                            <AutocompleteItem value="v_chair">Vice Chair</AutocompleteItem>
                                        </AutocompleteSection>
                                        <AutocompleteSection title="Publicity">
                                            <AutocompleteItem value="design_lead">Publicity Lead</AutocompleteItem>
                                            <AutocompleteItem value="designer">Designer</AutocompleteItem>
                                            <AutocompleteItem value="content_creator">Content Creator</AutocompleteItem>
                                            <AutocompleteItem value="social_media_coordinator">Social Media Coordinator</AutocompleteItem>
                                            <AutocompleteItem value="photographer">Photographer</AutocompleteItem>
                                            <AutocompleteItem value="videographer">Videographer</AutocompleteItem>
                                            <AutocompleteItem value="editor">Editor</AutocompleteItem>
                                            <AutocompleteItem value="video_editor">Video Editor</AutocompleteItem>
                                        </AutocompleteSection>
                                        <AutocompleteSection title="Logistics">
                                            <AutocompleteItem value="logistics_lead">Logistics Lead</AutocompleteItem>
                                            <AutocompleteItem value="logistics_coordinator">Logistics Coordinator</AutocompleteItem>
                                            <AutocompleteItem value="venue_coordinator">Venue Coordinator</AutocompleteItem>
                                            <AutocompleteItem value="transport_coordinator">Transport Coordinator</AutocompleteItem>
                                            <AutocompleteItem value="food_coordinator">Food Coordinator</AutocompleteItem>
                                            <AutocompleteItem value="accomodation_coordinator">Accomodation Coordinator</AutocompleteItem>
                                            <AutocompleteItem value="local_arrangement">Local Arrangement</AutocompleteItem>
                                        </AutocompleteSection>


                                    </Autocomplete>

                                </form>
                            </ModalBody>
                            <ModalFooter>
                                <Button isLoading={submitting} color="primary" variant='flat' onClick={assignVolunteer} >
                                    Assign the Volunteer
                                </Button>

                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>
        </div>
    )
}


const Evaluation = ({ projectID }) => {

    const [open, setOpen] = useState(false);
    const [volunteerList, setVolunteerList] = useState([]);
    const [volunteer, setVolunteer] = useState({
        member_id: '',
        first_name: '',
        last_name: '',
    });
    const [score, setScore] = useState(0);
    const [project, setProject] = useState({});
    const [month, setMonth] = useState('');
    const [loading, setLoading] = useState(false);
    const user = useUserStore(state => state.user);

  



    const searchForVolunteers = async () => {
        const { data, error } = await supabase.from('volunteer_project').select('users!inner(*),*').eq('project_id', projectID)
        if (error) {
            console.log(error);
            return;
        }
        console.log(data);
        setVolunteerList(data);
    }

    useEffect(() => {
        searchForVolunteers();
        supabase.from('projects').select('*,ous(*)').eq('id', projectID).then(({ data, error }) => {
            if (error) {
                console.log(error);
                return;
            }
            setProject(data[0]);
            console.log(data[0])
        })
    }, [])

    const onVolunteerSelection = async (value) => {
        const { data, error } = await supabase.from('users').select('member_id,first_name,last_name').eq('member_id', value);
        if (error) {
            console.log(error);
            return;
        }
        setVolunteer(data[0]);
    }

    const onCriteriaSelection = (e) => {
        let weight = 0;
        let { name } = e.target;

        console.log(e)

        if (name == "performance" || name == "timeliness" || name == "stress_handling" || name == "supervision" || name == "learning" || name == "training" || name == "attitude") {
            weight = 0.5;

        } else if (name == "dependability" || name == "involvement" || name == "role_modeling") {
            weight = 0.2;

        } else if (name == "cooperation" || name == "friendliness" || name == "listening" || name == "teamwork" || name == "assistance") {
            weight = 0.15;
        } else if (name == "professional_demeanor" || name == "conscientiousness" || name == "integrity") {
            weight = 0.1;
        } else if (name == "decision_making" || name == "timeliness" || name == "risk_assessment") {
            weight = 0.05;

        }

        let score = 0;
        switch (e.target.value) {
            case "Unsatisfactory":
                score = 0;
                break;
            case "Below Average":
                score = 1;
                break;
            case "Average":
                score = 2;
                break;
            case "Above Average":
                score = 3;
                break;
            case "Outstanding":
                score = 4;
                break;
        }

        const totalScore = weight * score;
        setScore((score) => score + totalScore);
    }

    const onEvaluationEnd = async () => {
        setLoading(true);
        const { data, error } = await supabase.from('volunteer_project_evaluate').insert({
            volunteer_id: volunteer.member_id,
            project_id: projectID,
            month,
            score
        });

        let score_ = score * project.score;

        await supabase.from('volunteer_project').update({ 
            score:score_
         }).eq('volunteer_id', volunteer.member_id).eq('project_id', projectID);

        const { data: userData, error: userError } = await supabase.from('users').select('score').eq('member_id', volunteer.member_id);

        console.log(userData[0].score + score);


        await supabase.from('users').update({
            score: userData[0].score + score
        }).eq('member_id', volunteer.member_id);

        setLoading(false);
        setOpen(false);
        if (error) {
            Swal.fire({
                title: 'Evaluation Submission Failed',
                text: `Evaluation for ${volunteer.first_name} ${volunteer.last_name} could not be submitted for ${month}`,
                icon: 'error',
                confirmButtonText: 'OK'
            });
            return;
        }
        Swal.fire({
            title: 'Evaluation Submitted',
            text: `Evaluation for ${volunteer.first_name} ${volunteer.last_name} has been submitted for ${month}`,
            icon: 'success',
            confirmButtonText: 'OK'
        });

        setMonth('');
        setScore(0);
    }

    useEffect(() => {
        if (month == '') return;
        
        supabase.from('volunteer_project_evaluate').select('*,users(*)').eq('volunteer_id', volunteer.member_id).eq('month', month).eq('project_id', projectID).then(({ data, error }) => {
            if (data.length > 0) {
                setOpen(false);
                Swal.fire({
                    title: 'Evaluation Exists',
                    text: `Evaluation for this volunteer already exists for ${month}`,
                    icon: 'warning',
                    confirmButtonText: 'OK'
                })
                setMonth('');
            }
            setScore(0);
        })
    }, [month])


    return (
        <Card className="mt-4 p-4">
            <div className="grid grid-cols-2 mb-2">
                <div className="flex items-center">
                    <h1 className="text-2xl font-bold ">Volunteer Evaluation</h1>
                </div>


            </div>
            <Table>
                <TableHeader>
                    <TableColumn>Member ID</TableColumn>
                    <TableColumn>First Name</TableColumn>
                    <TableColumn>Last Name</TableColumn>
                    <TableColumn>Role</TableColumn>
                    <TableColumn>Evaluation Status</TableColumn>
                </TableHeader>
                <TableBody>
                    {
                        volunteerList?.map((volunteer, index) => (
                            <TableRow key={index}>
                                <TableCell>{volunteer.users.member_id}</TableCell>
                                <TableCell>{volunteer.users.first_name}</TableCell>
                                <TableCell>{volunteer.users.last_name}</TableCell>
                                <TableCell>
                                    <Chip color="success" variant="flat" >{volunteer.role}</Chip>
                                </TableCell>
                                <TableCell>
                                    <Tooltip content="Evaluate Volunteer">
                                        <Button
                                            disabled={user.volunteer_project.find(({ project_id, role }) => (project_id == projectID && role == "Project Lead")) == undefined ? true : false}
                                            className="mx-2 my-2" color="primary" variant="flat" radius="full" isIconOnly onClick={() => {
                                                const canEvaluate = (user.volunteer_project.find(({ project_id, role }) => (project_id == projectID && role == "Project Lead")) == undefined ? false : true ) && volunteer.role == "Project Lead";

                                                if (canEvaluate) {
                                                    Swal.fire({
                                                        title: 'Permission Denied',
                                                        text: `You do not have the permission to evaluate yourself`,
                                                        icon: 'error',
                                                        confirmButtonText: 'OK'
                                                    });
                                                    return;
                                                }

                                                if(project.score==0 || project.score==null){

                                                    Swal.fire({
                                                        title: 'Project Score Not Set',
                                                        text: `Project score for this project has not been set. Please set the project score before evaluating volunteers`,
                                                        icon: 'warning',
                                                        confirmButtonText: 'OK'
                                                    });
                                                    setMonth('');
                                                    return;
                                                }

                                                setOpen(true);
                                                onVolunteerSelection(volunteer.users.member_id)
                                            }}>
                                            <UserAddOutlined />
                                        </Button>
                                    </Tooltip>
                                </TableCell>
                            </TableRow>
                        ))
                    }

                </TableBody>
            </Table>
            <Modal
                size='3xl'
                isOpen={open}
                onClose={() => setOpen(false)}
                placement="top"
            >
                <ModalContent>
                    {
                        (onClose) => (
                            <>
                                <ModalHeader className="flex flex-col gap-1">Evaluate Volunteer</ModalHeader>
                                <ModalBody>
                                    <form>

                                        <Input className="my-2" label="First Name" disabled placeholder="First Name" value={volunteer.first_name} />
                                        <Input className="my-2" label="Last Name" disabled placeholder="Last Name" value={volunteer.last_name} />
                                        {
                                            month == "" ?
                                                (
                                                    <Select label="Evaluation Month" className="my-2" placeholder="Select Evaluation Month"

                                                        onSelectionChange={(e) => setMonth(e.currentKey)}
                                                    >
                                                        {
                                                            getMonthsBetweenDates(new Date(project.start_date), new Date(project.end_date))
                                                                .filter(({ month, year }) => new Date(year, month) <= new Date())
                                                                .map(({ month, year }) => (
                                                                    <SelectItem value={`${getMonthName(month)} ${year}`} key={`${getMonthName(month)} ${year}`}>{getMonthName(month)} {year}</SelectItem>
                                                                ))
                                                        }
                                                    </Select>
                                                ) :
                                                (
                                                    <Input isDisabled className="my-2" label="Evaluation Month" disabled placeholder="Evaluation Month" value={month} />

                                                )
                                        }



                                        {/* Performance */}
                                        <h3 className="mt-5 mb-3 font-bold">Work Performance</h3>
                                        <div className="grid mb-6" style={{ gridTemplateColumns: "1fr 3fr" }}>
                                            <Tooltip content="High overall quality of performance" placement="bottom">
                                                <p>Performance</p>
                                            </Tooltip>
                                            <RadioGroup orientation="horizontal" className="flex"
                                                name="performance"
                                                onChange={onCriteriaSelection}
                                            >
                                                <Radio size="sm" radius="full" name="performance" value="Unsatisfactory">Unsatisfactory</Radio>
                                                <Radio size="sm" radius="full" name="performance" value="Below Average">Below Average</Radio>
                                                <Radio size="sm" radius="full" name="performance" value="Average">Average</Radio>
                                                <Radio size="sm" radius="full" name="performance" value="Above Average">Above Average</Radio>
                                                <Radio size="sm" radius="full" name="performance" value="Outstanding">Outstanding</Radio>
                                            </RadioGroup>
                                        </div>

                                        {/* Timeliness */}
                                        <div className="grid my-6" style={{ gridTemplateColumns: "1fr 3fr" }}>
                                            <Tooltip content="Accurately completes work on time" placement="bottom">
                                                <p>Timeliness</p>
                                            </Tooltip>
                                            <RadioGroup orientation="horizontal" className="flex"
                                                onChange={onCriteriaSelection}
                                                name="timeliness"
                                            >
                                                <Radio size="sm" radius="full" name="timeliness" value="Unsatisfactory">Unsatisfactory</Radio>
                                                <Radio size="sm" radius="full" name="timeliness" value="Below Average">Below Average</Radio>
                                                <Radio size="sm" radius="full" name="timeliness" value="Average">Average</Radio>
                                                <Radio size="sm" radius="full" name="timeliness" value="Above Average">Above Average</Radio>
                                                <Radio size="sm" radius="full" name="timeliness" value="Outstanding">Outstanding</Radio>
                                            </RadioGroup>
                                        </div>

                                        {/* Stress-handling */}
                                        <div className="grid my-6" style={{ gridTemplateColumns: "1fr 3fr" }}>
                                            <Tooltip content="Controls high-stress situations tactfully and calmly" placement="bottom">
                                                <p>Stress-handling</p>
                                            </Tooltip>
                                            <RadioGroup orientation="horizontal" className="flex"
                                                onChange={onCriteriaSelection}
                                                name="stress_handling"
                                            >
                                                <Radio size="sm" radius="full" name="stress_handling" value="Unsatisfactory">Unsatisfactory</Radio>
                                                <Radio size="sm" radius="full" name="stress_handling" value="Below Average">Below Average</Radio>
                                                <Radio size="sm" radius="full" name="stress_handling" value="Average">Average</Radio>
                                                <Radio size="sm" radius="full" name="stress_handling" value="Above Average">Above Average</Radio>
                                                <Radio size="sm" radius="full" name="stress_handling" value="Outstanding">Outstanding</Radio>
                                            </RadioGroup>
                                        </div>

                                        {/* Supervision */}
                                        <div className="grid my-6" style={{ gridTemplateColumns: "1fr 3fr" }}>
                                            <Tooltip content="Requires little supervision" placement="bottom">
                                                <p>Supervision</p>
                                            </Tooltip>
                                            <RadioGroup orientation="horizontal" className="flex"
                                                onChange={onCriteriaSelection}
                                                name="supervision"
                                            >
                                                <Radio size="sm" radius="full" name="supervision" value="Unsatisfactory">Unsatisfactory</Radio>
                                                <Radio size="sm" radius="full" name="supervision" value="Below Average">Below Average</Radio>
                                                <Radio size="sm" radius="full" name="supervision" value="Average">Average</Radio>
                                                <Radio size="sm" radius="full" name="supervision" value="Above Average">Above Average</Radio>
                                                <Radio size="sm" radius="full" name="supervision" value="Outstanding">Outstanding</Radio>
                                            </RadioGroup>
                                        </div>

                                        {/* Learning */}
                                        <div className="grid my-6" style={{ gridTemplateColumns: "1fr 3fr" }}>
                                            <Tooltip content="Willingness to learn and take on new responsibilities" placement="bottom">
                                                <p>Learning</p>
                                            </Tooltip>
                                            <RadioGroup orientation="horizontal" className="flex"
                                                onChange={onCriteriaSelection}
                                                name="learning"
                                            >
                                                <Radio size="sm" radius="full" name="learning" value="Unsatisfactory">Unsatisfactory</Radio>
                                                <Radio size="sm" radius="full" name="learning" value="Below Average">Below Average</Radio>
                                                <Radio size="sm" radius="full" name="learning" value="Average">Average</Radio>
                                                <Radio size="sm" radius="full" name="learning" value="Above Average">Above Average</Radio>
                                                <Radio size="sm" radius="full" name="learning" value="Outstanding">Outstanding</Radio>
                                            </RadioGroup>
                                        </div>

                                        {/* Training */}
                                        <div className="grid my-6" style={{ gridTemplateColumns: "1fr 3fr" }}>
                                            <Tooltip content="Ability to train others and gladly willing to do so" placement="bottom">
                                                <p>Training</p>
                                            </Tooltip>
                                            <RadioGroup orientation="horizontal" className="flex"
                                                onChange={onCriteriaSelection}
                                                name="training"
                                            >
                                                <Radio size="sm" radius="full" name="training" value="Unsatisfactory">Unsatisfactory</Radio>
                                                <Radio size="sm" radius="full" name="training" value="Below Average">Below Average</Radio>
                                                <Radio size="sm" radius="full" name="training" value="Average">Average</Radio>
                                                <Radio size="sm" radius="full" name="training" value="Above Average">Above Average</Radio>
                                                <Radio size="sm" radius="full" name="training" value="Outstanding">Outstanding</Radio>
                                            </RadioGroup>
                                        </div>

                                        {/* Attitude */}
                                        <div className="grid my-6" style={{ gridTemplateColumns: "1fr 3fr" }}>
                                            <Tooltip content="Dedicated to fulfilling job responsibilities" placement="bottom">
                                                <p>Attitude</p>
                                            </Tooltip>
                                            <RadioGroup orientation="horizontal" className="flex"
                                                onChange={onCriteriaSelection}
                                                name="attitude"
                                            >
                                                <Radio size="sm" radius="full" name="attitude" value="Unsatisfactory">Unsatisfactory</Radio>
                                                <Radio size="sm" radius="full" name="attitude" value="Below Average">Below Average</Radio>
                                                <Radio size="sm" radius="full" name="attitude" value="Average">Average</Radio>
                                                <Radio size="sm" radius="full" name="attitude" value="Above Average">Above Average</Radio>
                                                <Radio size="sm" radius="full" name="attitude" value="Outstanding">Outstanding</Radio>
                                            </RadioGroup>
                                        </div>

                                        {/* Repeat the structure for each criterion */}

                                        <h3 className="mt-5 mb-3 font-bold">Attitude and Commitment</h3>
                                        {/* Dependability */}
                                        <div className="grid mb-6" style={{ gridTemplateColumns: "1fr 3fr" }}>
                                            <Tooltip content="Consistently dependable and is punctual in reporting to work" placement="bottom">
                                                <p>Dependability</p>
                                            </Tooltip>
                                            <RadioGroup orientation="horizontal" className="flex"
                                                onChange={onCriteriaSelection}
                                                name="dependability"
                                            >
                                                <Radio size="sm" radius="full" name="dependability" value="Unsatisfactory">Unsatisfactory</Radio>
                                                <Radio size="sm" radius="full" name="dependability" value="Below Average">Below Average</Radio>
                                                <Radio size="sm" radius="full" name="dependability" value="Average">Average</Radio>
                                                <Radio size="sm" radius="full" name="dependability" value="Above Average">Above Average</Radio>
                                                <Radio size="sm" radius="full" name="dependability" value="Outstanding">Outstanding</Radio>
                                            </RadioGroup>
                                        </div>

                                        {/* Involvement */}
                                        <div className="grid my-6" style={{ gridTemplateColumns: "1fr 3fr" }}>
                                            <Tooltip content="Active involvement in committees, fund-raisers, fairs, trainings, & other miscellaneous activities" placement="bottom">
                                                <p>Involvement</p>
                                            </Tooltip>
                                            <RadioGroup orientation="horizontal" className="flex"
                                                onChange={onCriteriaSelection}
                                                name="involvement"
                                            >
                                                <Radio size="sm" radius="full" name="involvement" value="Unsatisfactory">Unsatisfactory</Radio>
                                                <Radio size="sm" radius="full" name="involvement" value="Below Average">Below Average</Radio>
                                                <Radio size="sm" radius="full" name="involvement" value="Average">Average</Radio>
                                                <Radio size="sm" radius="full" name="involvement" value="Above Average">Above Average</Radio>
                                                <Radio size="sm" radius="full" name="involvement" value="Outstanding">Outstanding</Radio>
                                            </RadioGroup>
                                        </div>

                                        {/* Role-modeling */}
                                        <div className="grid my-6" style={{ gridTemplateColumns: "1fr 3fr" }}>
                                            <Tooltip content="Serves as a role model to others" placement="bottom">
                                                <p>Role-modeling</p>
                                            </Tooltip>
                                            <RadioGroup orientation="horizontal" className="flex"
                                                onChange={onCriteriaSelection}
                                                name="role_modeling"
                                            >
                                                <Radio size="sm" radius="full" name="role_modeling" value="Unsatisfactory">Unsatisfactory</Radio>
                                                <Radio size="sm" radius="full" name="role_modeling" value="Below Average">Below Average</Radio>
                                                <Radio size="sm" radius="full" name="role_modeling" value="Average">Average</Radio>
                                                <Radio size="sm" radius="full" name="role_modeling" value="Above Average">Above Average</Radio>
                                                <Radio size="sm" radius="full" name="role_modeling" value="Outstanding">Outstanding</Radio>
                                            </RadioGroup>
                                        </div>
                                        <h3 className="mt-5 mb-3 font-bold">Interpersonal Skills</h3>

                                        {/* Cooperation */}
                                        <div className="grid my-6" style={{ gridTemplateColumns: "1fr 3fr" }}>
                                            <Tooltip content="Has a team player attitude" placement="bottom">
                                                <p>Cooperation</p>
                                            </Tooltip>
                                            <RadioGroup orientation="horizontal" className="flex"
                                                onChange={onCriteriaSelection}
                                                name="cooperation"
                                            >
                                                <Radio size="sm" radius="full" name="cooperation" value="Unsatisfactory">Unsatisfactory</Radio>
                                                <Radio size="sm" radius="full" name="cooperation" value="Below Average">Below Average</Radio>
                                                <Radio size="sm" radius="full" name="cooperation" value="Average">Average</Radio>
                                                <Radio size="sm" radius="full" name="cooperation" value="Above Average">Above Average</Radio>
                                                <Radio size="sm" radius="full" name="cooperation" value="Outstanding">Outstanding</Radio>
                                            </RadioGroup>
                                        </div>


                                        {/* Friendliness */}
                                        <div className="grid my-6" style={{ gridTemplateColumns: "1fr 3fr" }}>
                                            <Tooltip content="Consistently friendly and available to others" placement="bottom">
                                                <p>Friendliness</p>
                                            </Tooltip>
                                            <RadioGroup orientation="horizontal" className="flex"
                                                onChange={onCriteriaSelection}
                                                name="friendliness"
                                            >
                                                <Radio size="sm" radius="full" name="friendliness" value="Unsatisfactory">Unsatisfactory</Radio>
                                                <Radio size="sm" radius="full" name="friendliness" value="Below Average">Below Average</Radio>
                                                <Radio size="sm" radius="full" name="friendliness" value="Average">Average</Radio>
                                                <Radio size="sm" radius="full" name="friendliness" value="Above Average">Above Average</Radio>
                                                <Radio size="sm" radius="full" name="friendliness" value="Outstanding">Outstanding</Radio>
                                            </RadioGroup>
                                        </div>

                                        {/* Listening */}
                                        <div className="grid my-6" style={{ gridTemplateColumns: "1fr 3fr" }}>
                                            <Tooltip content="Uses effective listening skills" placement="bottom">
                                                <p>Listening</p>
                                            </Tooltip>
                                            <RadioGroup orientation="horizontal" className="flex"
                                                onChange={onCriteriaSelection}
                                                name="listening"
                                            >
                                                <Radio size="sm" radius="full" name="listening" value="Unsatisfactory">Unsatisfactory</Radio>
                                                <Radio size="sm" radius="full" name="listening" value="Below Average">Below Average</Radio>
                                                <Radio size="sm" radius="full" name="listening" value="Average">Average</Radio>
                                                <Radio size="sm" radius="full" name="listening" value="Above Average">Above Average</Radio>
                                                <Radio size="sm" radius="full" name="listening" value="Outstanding">Outstanding</Radio>
                                            </RadioGroup>
                                        </div>

                                        {/* Teamwork */}
                                        <div className="grid my-6" style={{ gridTemplateColumns: "1fr 3fr" }}>
                                            <Tooltip content="Has a team player attitude" placement="bottom">
                                                <p>Teamwork</p>
                                            </Tooltip>
                                            <RadioGroup orientation="horizontal" className="flex"
                                                onChange={onCriteriaSelection}
                                                name="teamwork"
                                            >
                                                <Radio size="sm" radius="full" name="teamwork" value="Unsatisfactory">Unsatisfactory</Radio>
                                                <Radio size="sm" radius="full" name="teamwork" value="Below Average">Below Average</Radio>
                                                <Radio size="sm" radius="full" name="teamwork" value="Average">Average</Radio>
                                                <Radio size="sm" radius="full" name="teamwork" value="Above Average">Above Average</Radio>
                                                <Radio size="sm" radius="full" name="teamwork" value="Outstanding">Outstanding</Radio>
                                            </RadioGroup>
                                        </div>

                                        {/* Assistance */}
                                        <div className="grid my-6" style={{ gridTemplateColumns: "1fr 3fr" }}>
                                            <Tooltip content="Voluntarily assists co-volunteers in order to complete important works" placement="bottom">
                                                <p>Assistance</p>
                                            </Tooltip>
                                            <RadioGroup orientation="horizontal" className="flex"
                                                onChange={onCriteriaSelection}
                                                name="assistance"
                                            >
                                                <Radio size="sm" radius="full" name="assistance" value="Unsatisfactory">Unsatisfactory</Radio>
                                                <Radio size="sm" radius="full" name="assistance" value="Below Average">Below Average</Radio>
                                                <Radio size="sm" radius="full" name="assistance" value="Average">Average</Radio>
                                                <Radio size="sm" radius="full" name="assistance" value="Above Average">Above Average</Radio>
                                                <Radio size="sm" radius="full" name="assistance" value="Outstanding">Outstanding</Radio>
                                            </RadioGroup>
                                        </div>

                                        <h3 className="mt-5 mb-3 font-bold">Personal Traits</h3>

                                        {/* Professional Demeanor */}
                                        <div className="grid mb-6" style={{ gridTemplateColumns: "1fr 3fr" }}>
                                            <Tooltip content="Professional demeanor" placement="bottom">
                                                <p>Professional demeanor</p>
                                            </Tooltip>
                                            <RadioGroup orientation="horizontal" className="flex"
                                                onChange={onCriteriaSelection}
                                                name="professional_demeanor"
                                            >
                                                <Radio size="sm" radius="full" name="professional_demeanor" value="Unsatisfactory">Unsatisfactory</Radio>
                                                <Radio size="sm" radius="full" name="professional_demeanor" value="Below Average">Below Average</Radio>
                                                <Radio size="sm" radius="full" name="professional_demeanor" value="Average">Average</Radio>
                                                <Radio size="sm" radius="full" name="professional_demeanor" value="Above Average">Above Average</Radio>
                                                <Radio size="sm" radius="full" name="professional_demeanor" value="Outstanding">Outstanding</Radio>
                                            </RadioGroup>
                                        </div>

                                        {/* Conscientiousness */}
                                        <div className="grid my-6" style={{ gridTemplateColumns: "1fr 3fr" }}>
                                            <Tooltip content="Conscientiousness" placement="bottom">
                                                <p>Conscientiousness</p>
                                            </Tooltip>
                                            <RadioGroup orientation="horizontal" className="flex"
                                                onChange={onCriteriaSelection}
                                                name="conscientiousness"
                                            >
                                                <Radio size="sm" radius="full" name="conscientiousness" value="Unsatisfactory">Unsatisfactory</Radio>
                                                <Radio size="sm" radius="full" name="conscientiousness" value="Below Average">Below Average</Radio>
                                                <Radio size="sm" radius="full" name="conscientiousness" value="Average">Average</Radio>
                                                <Radio size="sm" radius="full" name="conscientiousness" value="Above Average">Above Average</Radio>
                                                <Radio size="sm" radius="full" name="conscientiousness" value="Outstanding">Outstanding</Radio>
                                            </RadioGroup>
                                        </div>

                                        {/* Integrity */}
                                        <div className="grid my-6" style={{ gridTemplateColumns: "1fr 3fr" }}>
                                            <Tooltip content="Integrity" placement="bottom">
                                                <p>Integrity</p>
                                            </Tooltip>
                                            <RadioGroup orientation="horizontal" className="flex"
                                                onChange={onCriteriaSelection}
                                                name="integrity"
                                            >
                                                <Radio size="sm" radius="full" name="integrity" value="Unsatisfactory">Unsatisfactory</Radio>
                                                <Radio size="sm" radius="full" name="integrity" value="Below Average">Below Average</Radio>
                                                <Radio size="sm" radius="full" name="integrity" value="Average">Average</Radio>
                                                <Radio size="sm" radius="full" name="integrity" value="Above Average">Above Average</Radio>
                                                <Radio size="sm" radius="full" name="integrity" value="Outstanding">Outstanding</Radio>
                                            </RadioGroup>
                                        </div>
                                        <h3 className="mt-5 mb-3 font-bold">Additional Criteria
                                        </h3>

                                        {/* Decision-making */}
                                        <div className="grid mb-6" style={{ gridTemplateColumns: "1fr 3fr" }}>
                                            <Tooltip content="Considers potential outcomes and risks before making decisions" placement="bottom">
                                                <p>Decision-making</p>
                                            </Tooltip>
                                            <RadioGroup orientation="horizontal" className="flex"
                                                onChange={onCriteriaSelection}
                                                name="decision_making"
                                            >
                                                <Radio size="sm" radius="full" name="decision_making" value="Unsatisfactory">Unsatisfactory</Radio>
                                                <Radio size="sm" radius="full" name="decision_making" value="Below Average">Below Average</Radio>
                                                <Radio size="sm" radius="full" name="decision_making" value="Average">Average</Radio>
                                                <Radio size="sm" radius="full" name="decision_making" value="Above Average">Above Average</Radio>
                                                <Radio size="sm" radius="full" name="decision_making" value="Outstanding">Outstanding</Radio>
                                            </RadioGroup>
                                        </div>

                                        {/* Timeliness */}
                                        <div className="grid my-6" style={{ gridTemplateColumns: "1fr 3fr" }}>
                                            <Tooltip content="Makes timely and decisive decisions under pressure" placement="bottom">
                                                <p>Timeliness</p>
                                            </Tooltip>
                                            <RadioGroup orientation="horizontal" className="flex"
                                                onChange={onCriteriaSelection}
                                                name="timeliness"
                                            >
                                                <Radio size="sm" radius="full" name="pressure" value="Unsatisfactory">Unsatisfactory</Radio>
                                                <Radio size="sm" radius="full" name="pressure" value="Below Average">Below Average</Radio>
                                                <Radio size="sm" radius="full" name="pressure" value="Average">Average</Radio>
                                                <Radio size="sm" radius="full" name="pressure" value="Above Average">Above Average</Radio>
                                                <Radio size="sm" radius="full" name="pressure" value="Outstanding">Outstanding</Radio>
                                            </RadioGroup>
                                        </div>

                                        {/* Risk-assessment */}
                                        <div className="grid my-6" style={{ gridTemplateColumns: "1fr 3fr" }}>
                                            <Tooltip content="Implements proactive measures to prevent or minimize risks" placement="bottom">
                                                <p>Risk-assessment</p>
                                            </Tooltip>
                                            <RadioGroup orientation="horizontal" className="flex"
                                                onChange={onCriteriaSelection}
                                                name="risk_assessment"
                                            >
                                                <Radio size="sm" radius="full" name="risk_assessment" value="Unsatisfactory">Unsatisfactory</Radio>
                                                <Radio size="sm" radius="full" name="risk_assessment" value="Below Average">Below Average</Radio>
                                                <Radio size="sm" radius="full" name="risk_assessment" value="Average">Average</Radio>
                                                <Radio size="sm" radius="full" name="risk_assessment" value="Above Average">Above Average</Radio>
                                                <Radio size="sm" radius="full" name="risk_assessment" value="Outstanding">Outstanding</Radio>
                                            </RadioGroup>
                                        </div>



                                    </form>
                                </ModalBody>
                                <ModalFooter>
                                    <div className="flex justify-end">
                                        <Button className="mx-2 my-2" color="danger" variant="solid" radius="sm" endContent={<SendOutlined />} onClick={onEvaluationEnd} >
                                            End Evaluation
                                        </Button>
                                    </div>
                                </ModalFooter>
                            </>
                        )
                    }
                </ModalContent>
            </Modal>

        </Card>
    )
}

const Settings = ({ projectID }) => {

    const user = useUserStore(state => state.user);
    const [formValues, setFormValues] = useState({
        name: '',
        description: '',
        type: '',
        score: 0,
        start_date: '',
        end_date: '',
        status: ''
    });
    const [loading, setLoading] = useState(false);


    const saveProjectSettings = async () => {
        setLoading(true);
        const { data, error } = await supabase.from('projects').update({...formValues}).eq('id', projectID);
        if (error) {
            Swal.fire({
                title: 'Project Settings Update Failed',
                text: 'Project settings could not be updated',
                icon: 'error',
                confirmButtonText: 'OK'
            });
            setLoading(false);
            return;
        }
        setLoading(false);
        Swal.fire({
            title: 'Project Settings Updated',
            text: 'Project settings have been updated successfully',
            icon: 'success',
            confirmButtonText: 'OK'
        });
        refresh();
    }

    const refresh = async () => {
        supabase.from('projects').select('*').eq('id', projectID).then(({ data, error }) => {
            if (error) {
                console.log(error);
                return;
            }
            
            setFormValues({
                name: data[0].name,
                description: data[0].description,
                type: data[0].type,
                score:  data[0].score==0?getScorePointsForProjectType(data[0].type):data[0].score,
                start_date: data[0].start_date,
                end_date: data[0].end_date,
                status: data[0].status
            });
        
        })
    }

    useEffect(() => {
       refresh();
    }, [])

    const onStartProject = async () => {
        setLoading(true);
        
        const { data: projecrt} = await supabase.from('projects').select('*').eq('id',projectID)

        if(projecrt[0].score==0 || projecrt[0].score==null){
            Swal.fire({
                title: 'Project Score Not Set',
                text: `Project score for this project has not been set. Please set the project score before starting the project`,
                icon: 'warning',
                confirmButtonText: 'OK'
            });
            setLoading(false);
            return;
        }


        const {data,error} = await supabase.from('projects').update({
            status: 'STARTED'
        }).eq('id',projectID);

        if (error) {
            Swal.fire({
                title: 'Project Start Failed',
                text: 'Project could not be started',
                icon: 'error',
                confirmButtonText: 'OK'
            });
            setLoading(false);
            return;
        }

        Swal.fire({
            title: 'Project Started',
            text: 'Project has been started successfully',
            icon: 'success',
            confirmButtonText: 'OK'
        });
        setLoading(false);
    }

    const onEndProject = async () => {
        setLoading(true);
        const {data,error} = await supabase.from('projects').update({
            status: 'COMPLETED'
        }).eq('id',projectID);

        if (error) {
            Swal.fire({
                title: 'Project End Failed',
                text: 'Project could not be ended',
                icon: 'error',
                confirmButtonText: 'OK'
            });
            setLoading(false);
            return;
        }

        Swal.fire({
            title: 'Project Ended',
            text: 'Project has been ended successfully',
            icon: 'success',
            confirmButtonText: 'OK'
        });
        setLoading(false);
    }

    return (
        <Card className="mt-4 p-4">
            <div className="grid grid-cols-2 mb-2">
                <div className="flex items-center">
                    <h1 className="text-2xl font-bold ">Project Settings</h1>
                </div>
            </div>
            {/* Project Start date and end date */}

            <Input
                className="my-2"
                label="Project Name" value={formValues.name} disabled onChange={(value) => setFormValues({ ...formValues, name: value })} />

            <Textarea
                className="my-2"
                label="Project Description" value={formValues.description}
                onChange={(e) => setFormValues({ ...formValues, description: e.target.value })}
                />

            <Select label="Project Type" className="my-2" placeholder="Select project type" 
            onSelectionChange={(e) => setFormValues({ ...formValues, type: e.currentKey })}
            selectedKeys={[formValues.type]} >
                <SelectItem key="Technical Session">Technical Session</SelectItem>
                <SelectItem key="Workshop Session">Workshop Session</SelectItem>
                <SelectItem key="Non Technical Session">Non Technical Session</SelectItem>
                <SelectItem key="Session Series">Session Series</SelectItem>
                <SelectItem key="Adminstrative Session">Adminstrative Session</SelectItem>
                <SelectItem key="Fund Raise">Fund Raise</SelectItem>
                <SelectItem key="Outreach Project">Outreach Project</SelectItem>
                <SelectItem key="Other">Other</SelectItem>
            </Select>

            


            <Slider
                size="sm"
                step={0.1}
                color="foreground"
                label="Project Score"
                showSteps={true}
                maxValue={1}
                minValue={0}
                defaultValue={0.2}
                value={formValues.score}
                onChange={(value) => setFormValues({ ...formValues, score: value })}
                className="my-2"
                isDisabled={user.account_type != "SUPER_ADMIN"}
            />


            <div className="grid grid-cols-2 gap-4">
                <Input label="Project Start Date" value={formValues.start_date} onValueChange={(value) => setFormValues({ ...formValues, start_date: value })} placeholder="" type="date" />
                <Input label="Project End Date" value={formValues.end_date} onValueChange={(value) => setFormValues({ ...formValues, end_date: value })} placeholder="" type="date" />

            </div>

            <div className="flex justify-end mt-6">
                <Button
                    isLoading={loading}
                    onClick={saveProjectSettings}
                    className="mx-2 my-2" color="primary" variant="solid" radius="sm" endContent={<SaveOutlined />} >
                    Save Changes
                </Button>

                {
                    formValues.status == "PENDING" ? (
                        <Button
                            isLoading={loading}
                            onClick={onStartProject}
                            className="mx-2 my-2 text-white" color="success" variant="solid" radius="sm" endContent={<PlayCircleOutlined />} >
                            Start Project
                        </Button>
                    ) : (
                        <Button
                            isLoading={loading}
                            onClick={onEndProject}
                            isDisabled={formValues.status == "COMPLETED"}
                            className="mx-2 my-2  text-white" color="danger" variant="solid" radius="sm" endContent={<DeleteOutlined />} >
                            Complete the Project
                        </Button>
                    )
                }

            </div>

        </Card>
    )
}