import { SearchOutlined, FundProjectionScreenOutlined, RedoOutlined, DeleteTwoTone } from "@ant-design/icons"
import { TimeInput } from "@nextui-org/date-input";
import { DatePicker } from "@nextui-org/date-picker";
import { BreadcrumbItem, Breadcrumbs, Card, Input, Button, Table, TableHeader, TableColumn, TableBody, Spinner, Modal, ModalHeader, ModalBody, Select, ModalContent, Autocomplete, AutocompleteItem, ModalFooter, TableRow, TableCell, Tooltip, Pagination } from "@nextui-org/react"
import { useEffect, useState } from "react";
import supabase from "../supabase/client";
import Swal from "sweetalert2";
import { createEventSchema } from "../util/schema";

export default () => {


    const [open, setOpen] = useState(false);

    const [projects, setProjects] = useState([]);

    const [formValues, setFormValues] = useState({
        project_id: "",
        event_name: "",
        event_date: "",
        event_start_time: "",
        event_end_time: ""
    });

    const [isLoading, setIsLoading] = useState(false);
    const [events, setEvents] = useState([]);
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [totalPageCount, setTotalPageCount] = useState(0);

    const getEvents = async () => {
        setIsLoading(true);
        const { data, error } = await supabase.from('events').select('*,projects(*)').ilike('name', `%${search}%`).range((page - 1) * 10, page * 10 - 1);
        if (error) {
            console.log(error);
            return;
        }
        setEvents(data);
        setIsLoading(false);
    }

    useEffect(() => {
        getEvents();
    }, [page]);


    useEffect(() => {
        setPage(1);
        getEvents();
    }, [search]);

    const getTotalPageCount = async () => {
        const { data, error } = await supabase.from('events').select('*,projects(*)', { count: 'exact' }).ilike('name', `%${search}%`);
        if (error) {
            console.log(error);
            return;
        }
        setTotalPageCount(Math.ceil(data.count / 10));
    }

    useEffect(() => {
        getTotalPageCount();
    }, [search]);



    const createEvent = async () => {
        setIsLoading(true);

        const { error } = await createEventSchema.validate(formValues);

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



        const { data } = await supabase.from('events').insert({
            project_id: formValues.project_id,
            name: formValues.event_name,
            date: formValues.event_date,
            start_time: formValues.event_start_time,
            end_time: formValues.event_end_time
        });
        
        setIsLoading(false);
        setOpen(false);

        Swal.fire({
            title: 'Event Created',
            text: 'Event has been created successfully',
            icon: 'success',
            confirmButtonText: 'Ok'
        });

        getEvents();
    }

    const onDelete = async (id) => {
        Swal.fire({
            title: 'Are you sure?',
            text: 'Do you want to delete this event?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes',
            cancelButtonText: 'No'
        }).then((result)=>{
            if(result.isConfirmed){
                supabase.from('events').delete().eq('id',id).then((data,error)=>{
                    if(error){
                        console.log(error);
                        return;
                    }
                    Swal.fire({
                        title: 'Event Deleted',
                        text: 'Event has been deleted successfully',
                        icon: 'success',
                        confirmButtonText: 'Ok'
                    });
                    getEvents();
                });
            }
        });
    
    }


    const getProjects = async (name) => {
        const { data, error } = await supabase.from('projects').select('*').ilike('name', `%${name}%`);
        if (error) {
            console.log(error);
            return;
        }
        console.log(data);
        setProjects(data);
    }

    useEffect(() => {
        console.log(formValues);
    }, [formValues]);

    return (
        <div className="w-[90%] m-auto">
            <Breadcrumbs className="mt-4">
                <BreadcrumbItem href="/">Home</BreadcrumbItem>
                <BreadcrumbItem href="/volunteer">Events</BreadcrumbItem>
            </Breadcrumbs>
            <Card className="mt-4 p-4">
                <h1 className="text-2xl font-bold">Events</h1>
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
                        onChange={
                            (e) => setSearch(e.target.value)
                        }
                        />
                    </div>
                    <div className="flex items-center">
                        <Button className="mx-2" color="primary" variant="solid" radius="sm" onClick={() => setOpen(true)} endContent={<FundProjectionScreenOutlined />}>
                            Add Event
                        </Button>
                        <Button className="mx-2" color="primary" variant="bordered" radius="sm" endContent={<RedoOutlined />} onClick={() => {
                            setSearch("");
                            setPage(1);
                            getEvents();
                        
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
                            <TableColumn>Event ID</TableColumn>
                            <TableColumn>Event Name</TableColumn>
                            <TableColumn>Project Name</TableColumn>
                            <TableColumn>Event Date</TableColumn>
                            <TableColumn>Start Time</TableColumn>
                            <TableColumn>End Time</TableColumn>
                            <TableColumn>Actions</TableColumn>
                        </TableHeader>
                        <TableBody
                            loadingContent={<Spinner />}
                            isLoading={isLoading}
                        >
                            {
                                events.map((event, index) => (
                                    <TableRow key={index}>
                                        <TableCell >{event.id}</TableCell>
                                        <TableCell>{event.name}</TableCell>
                                        <TableCell>{event.projects.name}</TableCell>
                                        <TableCell>{event.date}</TableCell>
                                        <TableCell>{event.start_time}</TableCell>
                                        <TableCell>{event.end_time}</TableCell>
                                        <TableCell>
                                            <div className="relative flex items-center gap-2">
                                                <Tooltip content="Delete">
                                                    <span className="text-lg text-danger cursor-pointer active:opacity-50">
                                                        <DeleteTwoTone onClick={()=>onDelete(event.id)} />
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

            <Modal
                isOpen={open}
                onClose={() => setOpen(false)}
                title="Add Event"
                size="md"

            >
                <ModalContent>
                    {
                        (onClose) => (
                            <>
                                <ModalHeader className="flex flex-col gap-1">Create an Event</ModalHeader>
                                <ModalBody>
                                    <form>
                                        {/* list all the projects and select it */}
                                        <Autocomplete label="Project" className="my-2" placeholder="Select a project"
                                            onSelectionChange={
                                                (key) => setFormValues({ ...formValues, project_id: key })
                                            }
                                            onInputChange={
                                                (e) => {
                                                    getProjects(e);
                                                }
                                            }
                                        >
                                            {
                                                projects.map((project, index) => (
                                                    <AutocompleteItem key={project.id}>{project.name}</AutocompleteItem>
                                                ))

                                            }
                                        </Autocomplete>

                                        <Input label="Event Name" className="my-2" placeholder="Enter event name"
                                            onChange={(e) => setFormValues({ ...formValues, event_name: e.target.value })}
                                        />

                                        <DatePicker label="Event Date" className="my-4" placeholder="Select event date"
                                            onChange={(date) => setFormValues({ ...formValues, event_date: date.toString() })}
                                        />

                                        <TimeInput  label="Event Start Time" className="my-4" placeholder="Select event time"
                                            onChange={(time) => setFormValues({ ...formValues, event_start_time: time.toString() })}
                                            defaultValue={new Date()}
                                        />

                                        <TimeInput label="Event End Time" className="my-4" placeholder="Select event time"
                                            onChange={(time) => setFormValues({ ...formValues, event_end_time: time.toString() })}
                                            defaultValue={new Date()}
                                        />



                                    </form>



                                </ModalBody>
                                <ModalFooter>
                                    <Button isLoading={isLoading} color="primary" variant='flat' onPress={createEvent}>
                                        Create Event
                                    </Button>

                                </ModalFooter>
                            </>
                        )
                    }
                </ModalContent>

            </Modal>

        </div>
    )
}