import { DeleteFilled, DeleteTwoTone, EditFilled, EditTwoTone, EyeFilled, EyeTwoTone, FundProjectionScreenOutlined, RedoOutlined, SearchOutlined, UserAddOutlined } from "@ant-design/icons";
import { BreadcrumbItem, Breadcrumbs, Button, Card, Chip, Input, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, Pagination, Select, SelectItem, Spinner, Switch, Table, TableBody, TableCell, TableColumn, TableHeader, TableRow, Textarea, Tooltip } from "@nextui-org/react"
import { useEffect, useState } from "react";
import supabase from "../supabase/client";
import { Navigate, useNavigate } from "react-router-dom";
import { useUserStore } from "../util/store";
import { getOrgs, getUserAccess } from "../util/auth";
import { capitalize } from "radash";
import Swal from "sweetalert2";
import { createProjectSchema } from "../util/schema";

export default () => {

    const [open, setOpen] = useState(false);
    const [ous, setOus] = useState([]);
    const [selectedOus, setSelectedOus] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [projects, setProjects] = useState([]);

    const [showDialog, setShowDialog] = useState({
        deleteProject: false,
        editProject: false,
        project_id: 0
    });

    const navigate = useNavigate();

    const [access, setAccess] = useState({
        view: false,
        edit: false,
        delete: false
    });

    const userDetails = useUserStore(state => state.user);

    useEffect(() => {

        if (userDetails == null) return;
        if (ous.length == 0) return;


        const ouAccess = ous.map((ou) => ({ ou_id: ou.id, role: "SECRETARY" }));
        setAccess({
            view: getUserAccess(userDetails, ["GENERAL"], []),
            edit: getUserAccess(userDetails, [], [...ouAccess, { ou_id: 1, role: "SECRETARY" }]),
            delete: getUserAccess(userDetails, [], [...ouAccess, { ou_id: 1, role: "SECRETARY" }])
        });

    }, [userDetails, ous])



    const [formValues, setFormValues] = useState({
        name: '',
        active: false,
        type: '',
        description: '',
        ous: []
    })

    const fetchProjects = async () => {
        setIsLoading(true)
        const { data, error } = await supabase.from('projects').select('id,name,active,type,ous(*),status').order('id', { ascending: true });
        if (error) {
            console.log(error);
            return;
        }
        setIsLoading(false)
        setProjects(data);
    }

    async function fetchOUs() {
        setIsLoading(true)
        const { data, error } = await supabase.from('ous').select('*');
        if (error) {
            console.log(error);
            return;
        }
        setIsLoading(false)
        setOus(data);

    }


    useEffect(() => {
        fetchProjects();
        fetchOUs();
    }, [])

    const submitProject = async() => {
        setIsLoading(true);

        formValues.ous = selectedOus;

        const { error } = await createProjectSchema.validate(formValues);


        if (error) {
            Swal.fire({
                title: 'Error',
                text: error.message,
                icon: 'error',
                confirmButtonText: 'Ok'
            });
            setIsLoading(false);
            return;
        }

        delete formValues.ous;

        supabase.from('projects').insert(formValues).select().then(async (r) => {
            console.log(r);
            const { id } = r.data[0];
            supabase.from('ou_project').insert(Array.from(selectedOus).map(ou => ({ ou_id: ou, project_id: id }))).then((r) => {
                console.log(r);
            })
        }).finally(() => {
            setIsLoading(false)
            setOpen(false);
            fetchProjects();
        })

    }

    useEffect(() => { console.log(Array.from(selectedOus)) }, [selectedOus])

    return (
        <div className="w-[90%] m-auto">
            <Breadcrumbs className="mt-4">
                <BreadcrumbItem href="/">Home</BreadcrumbItem>
                <BreadcrumbItem href="/volunteer">Projects</BreadcrumbItem>
            </Breadcrumbs>

            <Card className="mt-4 p-4">
                <h1 className="text-2xl font-bold">Projects</h1>
                <div className="grid mb-2" style={{ gridTemplateColumns: '2fr 1fr' }}>
                    <div className="flex items-center my-3">
                        <Input
                            classNames={{
                                base: "max-w-full  h-10",
                                mainWrapper: "h-full w-full",
                                input: "text-small w-full",
                                inputWrapper: "h-full font-normal text-default-500 bg-default-400/20 dark:bg-default-500/20",
                            }}
                            placeholder="Type to search..."
                            size="sm"
                            startContent={<SearchOutlined size={18} />}
                            type="search"
                        // onChange={handleSearch}
                        />
                    </div>
                    <div className="flex items-center">
                        <Button className="mx-2" color="primary" variant="solid" radius="sm" onClick={() => setOpen(true)} endContent={<FundProjectionScreenOutlined />}>
                            Add Project
                        </Button>
                        <Button className="mx-2" color="primary" variant="bordered" radius="sm" endContent={<RedoOutlined />} onClick={() => {
                            fetchProjects()
                        }}>
                            Refresh
                        </Button>
                    </div>
                </div>
                <div>
                    <Table
                    // bottomContent={
                    //     totalPageCount > 0 ? (
                    //         <div className="flex w-full justify-center">
                    //             <Pagination
                    //                 isCompact
                    //                 showControls
                    //                 showShadow
                    //                 color="primary"
                    //                 // page={page}
                    //                 // total={totalPageCount}
                    //                 // onChange={(p) => setPage(p)}
                    //             />
                    //         </div>
                    //     ) : null
                    // }

                    >
                        <TableHeader>
                            <TableColumn>Project ID</TableColumn>
                            <TableColumn>Project Name</TableColumn>
                            <TableColumn>Organizational Unit</TableColumn>
                            <TableColumn>Project Type</TableColumn>
                            <TableColumn>Active</TableColumn>
                            <TableColumn>Project Status</TableColumn>
                            <TableColumn>Actions</TableColumn>
                        </TableHeader>
                        <TableBody
                            loadingContent={<Spinner />}
                            isLoading={isLoading}
                        >
                            {
                                projects.map((project) => (
                                    <TableRow key={project.id}>

                                        <TableCell>{project.id}</TableCell>
                                        <TableCell>{project.name}</TableCell>
                                        <TableCell>
                                            {
                                                project.ous.map((ou) => (
                                                    <Chip key={ou.id} className="m-1" color="primary" variant="flat" >{ou.short_name}</Chip>
                                                ))
                                            }
                                        </TableCell>
                                        <TableCell>
                                            <Chip color="warning" variant="flat" >{project.type}</Chip>
                                        </TableCell>
                                        <TableCell>
                                            <Chip color={project.active ? "success" : "danger"} variant="flat" >{project.active ? "Active" : "Inactive"}</Chip>
                                        </TableCell>
                                        <TableCell>
                                            <Chip color={project.status=="COMPLETED" ? "success" : project.status=="STARTED" ? "warning" : "danger"} variant="flat" >{capitalize(project.status)}</Chip>
                                        </TableCell>
                                        <TableCell>
                                            <div className="relative flex items-center gap-2">
                                                <Tooltip content="Details">
                                                    <span className="text-lg text-default-400 cursor-pointer active:opacity-50">
                                                        <EyeTwoTone onClick={() => navigate(`${project.id}`)} />
                                                    </span>
                                                </Tooltip>
                                                {
                                                    getUserAccess(userDetails, [], project.ous.map(o => ({ ou_id: o.id, role: "CHAIRMAN" }, { ou_id: o.id, role: "SECRETARY" }))) ? (
                                                        <Tooltip content="Edit Project">
                                                            <span className="text-lg text-primary cursor-pointer active:opacity-50">
                                                                <EditTwoTone onClick={() => {
                                                                    setShowDialog({ ...showDialog, editProject: true, project_id: project.id });
                                                                }} />
                                                            </span>
                                                        </Tooltip>
                                                    ) : null
                                                }
                                                {
                                                    getUserAccess(userDetails, [], project.ous.map(o => ({ ou_id: o.id, role: "CHAIRMAN" }))) ? (

                                                        <Tooltip content="Delete Project">
                                                            <span className="text-lg text-danger cursor-pointer active:opacity-50">
                                                                <DeleteTwoTone onClick={() => {
                                                                    setShowDialog({ ...showDialog, deleteProject: true, project_id: project.id });
                                                                }} />
                                                            </span>
                                                        </Tooltip>
                                                    ) : null
                                                }
                                            </div>
                                        </TableCell>

                                    </TableRow>
                                ))
                            }
                        </TableBody>
                    </Table>
                </div>
            </Card>
            <Modal
                size='xl'
                isOpen={open}
                onClose={() => setOpen(false)}
            >
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader className="flex flex-col gap-1">Project Details</ModalHeader>
                            <ModalBody>
                                <form>
                                    <Input label="Project Name" className="my-2" placeholder="Enter project name" onChange={e => setFormValues({ ...formValues, name: e.target.value })} />
                                    <Select label="Project Type" className="my-2" placeholder="Select project type" selectedKeys={[formValues.type]} onChange={e => setFormValues({ ...formValues, type: e.target.value })} >
                                        <SelectItem key="Technical Session">Technical Session</SelectItem>
                                        <SelectItem key="Workshop Session">Workshop Session</SelectItem>
                                        <SelectItem key="Non Technical Session">Non Technical Session</SelectItem>
                                        <SelectItem key="Session Series">Session Series</SelectItem>
                                        <SelectItem key="Adminstrative Session">Adminstrative Session</SelectItem>
                                        <SelectItem key="Fund Raise">Fund Raise</SelectItem>
                                        <SelectItem key="Outreach Project">Outreach Project</SelectItem>
                                        <SelectItem key="Other">Other</SelectItem>
                                    </Select>
                                    <Textarea label="Project Description" className="my-2" placeholder="Enter project description" onChange={e => setFormValues({ ...formValues, description: e.target.value })} />
                                    <Select selectedKeys={selectedOus} onSelectionChange={setSelectedOus} selectionMode="multiple" label="Project Organizational Unit" className="my-2" placeholder="Select project OU" >
                                        {
                                            ous.map((ou) => (
                                                <SelectItem key={ou.id} value={ou.id}>{ou.name}</SelectItem>
                                            ))
                                        }
                                    </Select>
                                    {/* <div className="flex items-center">
                                  {
                                    Array.from(selectedOus).map((ou) => {

                                        const name = ous.filter(o=>o.id==ou)[0]?.name;

                                        return (
                                            <Chip key={ou} className="m-1" color="primary" variant="flat" >{name}</Chip>
                                        )
                                    
                                    })
                                  }
                                </div> */}
                                    <Switch onValueChange={value => setFormValues({ ...formValues, active: value })} className="my-2" size="sm">Active</Switch>

                                </form>
                            </ModalBody>
                            <ModalFooter>
                                <Button isLoading={isLoading} color="primary" variant='flat' onPress={submitProject}>
                                    Create Project
                                </Button>

                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>

            <DeleteProject showDialog={showDialog.deleteProject} project_id={showDialog.project_id} setShowDialog={() => {
                setShowDialog({ ...showDialog, deleteProject: false });
                fetchProjects();
            }} />

            <EditProject showDialog={showDialog.editProject} project_id={showDialog.project_id} setShowDialog={() => {
                setShowDialog({ ...showDialog, editProject: false });
                fetchProjects();
            }} ous={ous} />




        </div>
    )
}

const EditProject = ({ showDialog, setShowDialog, project_id, ous }) => {

    const [project, setProject] = useState({
        name: '',
        type: '',
        description: '',
        active: false,
        ous: []
    });

    const [isLoading, setIsLoading] = useState(false);
    const [isContentLoading, setIsContentLoading] = useState(true);

    const updateProject = async () => {
        setIsLoading(true);


        // await supabase.from('ou_project').delete().match({project_id});

        // await supabase.from('ou_project').insert(project.ous.map(ou=>({ou_id:ou.id,project_id})));

        delete project.ous;

        const { error } = await supabase.from('projects').update(project).match({ id: project_id });
        if (error) {
            console.log(error);
            return;
        }
        setShowDialog();
        setIsLoading(false);
    }

    useEffect(() => {
        console.log(project_id);
        (async () => {
            const { data, error } = await supabase.from('projects').select('*,ous(*)').match({ id: project_id });
            if (error) {
                console.log(error);
                return;
            }
            console.log(data[0])
            setProject(data[0]);
            setIsContentLoading(false);
        })()
    }, [project_id])


    useEffect(() => { console.log(project?.ous?.map(o => `${o.id}`)) }, [project])


    return (
        <Modal
            size='xl'
            isOpen={showDialog}
            onClose={setShowDialog}
        >
            {
                isContentLoading ? <Spinner /> : (
                    <ModalContent>
                        {(onClose) => (
                            <>
                                <ModalHeader className="flex flex-col gap-1">Project Details</ModalHeader>
                                <ModalBody>
                                    <form>
                                        <Input label="Project Name" className="my-2" placeholder="Enter project name" value={project?.name} onChange={e => setProject({ ...project, name: e.target.value })} />
                                        <Select label="Project Type" className="my-2" placeholder="Select project type" selectedKeys={[project?.type]} onChange={e => setProject({ ...project, type: e.target.value })} >
                                            <SelectItem key="Technical Session">Technical Session</SelectItem>
                                            <SelectItem key="Workshop Session">Workshop Session</SelectItem>
                                            <SelectItem key="Non Technical Session">Non Technical Session</SelectItem>
                                            <SelectItem key="Session Series">Session Series</SelectItem>
                                            <SelectItem key="Adminstrative Session">Adminstrative Session</SelectItem>
                                            <SelectItem key="Fund Raise">Fund Raise</SelectItem>
                                            <SelectItem key="Outreach Project">Outreach Project</SelectItem>
                                            <SelectItem key="Other">Other</SelectItem>
                                        </Select>
                                        <Textarea label="Project Description" className="my-2" value={project?.description} placeholder="Enter project description" onChange={e => setProject({ ...project, description: e.target.value })} />
                                        <Select disabled isDisabled={true} selectedKeys={project?.ous?.map(o => `${o.id}`)} selectionMode="multiple" label="Project Organizational Unit" className="my-2" placeholder="Select project OU" onSelectionChange={o => setProject({ ...project, ous: [...ous.filter(e => Array.from(o).includes(`${e.id}`))] })} >
                                            {
                                                ous.map((ou) => (
                                                    <SelectItem key={ou.id} value={ou.id}>{ou.name}</SelectItem>
                                                ))
                                            }

                                        </Select>

                                        <Switch isSelected={project?.active} onValueChange={value => setProject({ ...project, active: value })} className="my-2" size="sm">Active</Switch>

                                    </form>
                                </ModalBody>
                                <ModalFooter>
                                    <Button isLoading={isLoading} color="primary" variant='flat' onPress={updateProject}>
                                        Update Project
                                    </Button>

                                </ModalFooter>
                            </>
                        )}
                    </ModalContent>
                )
            }
        </Modal>

    )
}


const DeleteProject = ({ showDialog, setShowDialog, project_id }) => {

    return (
        <Modal
            size='xl'
            isOpen={showDialog}
            onClose={setShowDialog}
        >
            <ModalContent>
                {
                    (onClose) => (
                        <>
                            <ModalHeader className="flex flex-col gap-1">Delete Project</ModalHeader>
                            <ModalBody>
                                <p className="text-gray-500">Are you sure you want to delete the Project?. This will as <span className="font-semibold">remove all the volunteer details and their scores </span> as well.</p>
                            </ModalBody>
                            <ModalFooter>
                                <Button color="danger" variant='flat' onClick={async () => {
                                    const { error } = await supabase.from('projects').delete().match({ id: project_id });
                                    if (error) {
                                        console.log(error);
                                        return;
                                    }
                                    setShowDialog();

                                }} >
                                    Delete the Project
                                </Button>
                                <Button color="primary" variant='flat' onClick={setShowDialog} >
                                    Cancel
                                </Button>
                            </ModalFooter>
                        </>
                    )
                }
            </ModalContent>
        </Modal>
    )
}