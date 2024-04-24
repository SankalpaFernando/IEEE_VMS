import { CheckOutlined, EyeTwoTone, UploadOutlined, SearchOutlined, RedoOutlined, CloudDownloadOutlined, BarChartOutlined } from "@ant-design/icons"
import { BreadcrumbItem, Breadcrumbs, Button, Card, Chip, Input, Pagination, Select, SelectItem, Spinner, Tab, Table, TableBody, TableCell, TableColumn, TableHeader, TableRow, Tabs, Tooltip, input } from "@nextui-org/react"
import { useEffect, useRef, useState } from "react"
import Papa from 'papaparse';
import supabase from "../supabase/client";
import { useNavigate } from "react-router-dom";
import { getMonthName, getMonthsBetweenDates } from "../util/util";

export default () => {
    return (
        <div className="w-[90%] m-auto">
            <Breadcrumbs className="mt-4">
                <BreadcrumbItem href="../">Home</BreadcrumbItem>
                <BreadcrumbItem href="../ous">Admin Tools</BreadcrumbItem>
            </Breadcrumbs>
            <Tabs className="mt-4 ">
                <Tab key="stat" title="Membership Statistics">
                    <MembershipStats />
                </Tab>
                <Tab key="photos" title="Member Upload">
                    <MemberUpload />
                </Tab>
                <Tab key="videos" title="Pending Activities">
                    <PendingActivities />
                </Tab>
            </Tabs>
        </div>
    )
}

const MembershipStats = () => {

    const [topVolunteers, setTopVolunteers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [totalPageCount, setTotalPageCount] = useState(0);
    const [filterType, setFilterType] = useState("total");
    const [volunteerStats, setVolunteerStats] = useState({
        total: 0,
        active: 0,
        inactive: 0
    });

    const getTopVolunteersPage = async () => {
        const { data } = await supabase.from("users").select("*")
        
        setVolunteerStats((v) => ({
            ...v,
            total: data.length
        }))

        if(filterType == "total"){
            setTotalPageCount(Math.ceil(data.length / 10));
        }else if(filterType == "active"){
            const { data } = await supabase.from("users").select("*").eq("ieee_status", true)
            setTotalPageCount(Math.ceil(data.length / 10));
        }else if(filterType == "inactive"){
            const { data } = await supabase.from("users").select("*").eq("ieee_status", false)
            setTotalPageCount(Math.ceil(data.length / 10));
        }
    }

    const getTopVolunteers = async () => {
        setLoading(true);

        console.log(page);

        if (filterType == "total") {
            const { data } = await supabase.from("users").select("*").range((page - 1) * 10, page * 10 - 1)

            setTopVolunteers(data);
            setLoading(false);
            return
        }
         if (filterType == "active") {
            const { data } = await supabase.from("users").select("*").eq("ieee_status", true).range((page - 1) * 10, page * 10 - 1)
            setTopVolunteers(data);
            setLoading(false);
            return
        }
         if (filterType == "inactive") {
            const { data } = await supabase.from("users").select("*").eq("ieee_status", false).range((page - 1) * 10, page * 10 - 1)
            setTopVolunteers(data);
            setLoading(false);
        }

   }

    const getInactiveVolunteers = async () => {
        const { data } = await supabase.from("users").select("*").eq("ieee_status", false);
        setVolunteerStats((v) => ({
            ...v,
            inactive: data.length
        }))
    }

    const getActiveVolunteers = async () => {
        const { data } = await supabase.from("users").select("*").eq("ieee_status", true);
        setVolunteerStats((v) => ({
            ...v,
            active: data.length
        }))
    }

    useEffect(() => {
        getInactiveVolunteers();
        getActiveVolunteers();
    }, [])

    useEffect(() => {
        setPage(1);
        getTopVolunteersPage()
        getTopVolunteers();

    }, [filterType])


    useEffect(() => {
        getTopVolunteers();
    }, [page])


    const downloadData = async () => {

        let csvData = [];

        if(filterType == "total"){
            const { data } = await supabase.from("users").select("member_id,first_name,last_name,email_address")
            csvData = data;
        }else if(filterType == "active"){
            const { data } = await supabase.from("users").select("member_id,first_name,last_name,email_address").eq("ieee_status", true);
            csvData = data;
        }else if(filterType == "inactive"){
            const { data } = await supabase.from("users").select("member_id,first_name,last_name,email_address").eq("ieee_status", false);
            csvData = data;
        }

        const csv = Papa.unparse(csvData);
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const downloadBtn = document.createElement('a');
        downloadBtn.setAttribute('href', url);
        downloadBtn.setAttribute('download', 'volunteers.csv');
        downloadBtn.click();
        
       
    }




    return (
        <>
            <div className="grid grid-cols-3 gap-4 mt-1 mb-4">
                {/* Stat Card */}
                <Card className="w-[100%] p-4" isPressable
                    onClick={() => setFilterType("total")}
                >
                    <div className="flex justify-between w-full">
                        <div className="flex flex-col">
                            <h1 className="text-xl font-light text-gray-500">Total Volunteers</h1>
                            <h1 className="text-3xl font-bold text-left">{volunteerStats.total}</h1>
                        </div>
                        <BarChartOutlined />
                    </div>
                </Card>
                <Card className="w-[100%] p-4" isPressable
                    onClick={() => setFilterType("active")}
                >
                    <div className="flex justify-between w-full">
                        <div className="flex flex-col">
                            <h1 className="text-xl font-light text-gray-500">Active Volunteers</h1>
                            <h1 className="text-3xl font-bold text-left">{volunteerStats.active}</h1>
                        </div>
                        <BarChartOutlined />
                    </div>
                </Card>
                <Card className="w-[100%] p-4" isPressable
                    onClick={() => setFilterType("inactive")}
                >
                    <div className="flex justify-between w-full">
                        <div className="flex flex-col">
                            <h1 className="text-xl font-light text-gray-500">Inactive Volunteers</h1>
                            <h1 className="text-3xl font-bold text-left">{volunteerStats.inactive}</h1>
                        </div>
                        <BarChartOutlined />
                    </div>
                </Card>
            </div>
            <Card className="mt-1 p-4">
                <div className="grid mb-2" style={{ gridTemplateColumns: '2fr 1fr' }}>
                    <div className="flex items-center my-3">
                    <h1 className="text-2xl font-bold">{
                            filterType == "total" ? "Volunteers" : filterType == "active" ? "Active Volunteers" : "Inactive Volunteers"
                        }</h1>                        
                    </div>
                    <div className="flex items-center justify-end">
                        <Button  className="mx-2" color="primary" onClick={downloadData} variant="solid" radius="sm"  endContent={<CloudDownloadOutlined />}>
                           Download CSV
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
                            <TableColumn>Name</TableColumn>
                            <TableColumn>Email</TableColumn>
                            <TableColumn>Score</TableColumn>
                        </TableHeader>
                        <TableBody
                            loadingContent={<Spinner />}
                            isLoading={loading}
                        >
                            {
                                topVolunteers.map((volunteer, index) => (
                                    <TableRow>
                                        {/* <TableCell>{index + 1}</TableCell> */}
                                        <TableCell>{volunteer.member_id}</TableCell>
                                        <TableCell>{volunteer.first_name} {volunteer.last_name}</TableCell>
                                        <TableCell>{volunteer.email_address}</TableCell>
                                        <TableCell>{volunteer.score}</TableCell>
                                    </TableRow>
                                ))
                            }
                        </TableBody>
                    </Table>
                </div>
            </Card>
        </>
    )
}


const MemberUpload = () => {

    const [fileName, setFileName] = useState("");
    const [records, setRecords] = useState([]);
    const [ou, setOu] = useState(1);
    const [ous, setOus] = useState([]);
    const [dpCount, setDpCount] = useState({
        dup_count: 0,
        reactivated: 0

    });
    const [newCount, setNewCount] = useState(0);
    const [loading, setLoading] = useState({
        reading: {
            start: false,
            end: false
        },
        uploading: {
            start: false,
            end: false
        },
        deactivate: {
            start: false,
            end: false
        }

    });

    const onFileInput = () => {

        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.onchange = _ => {
            const csv = fileInput.files[0];
            Papa.parse(csv, {
                header: true,
                complete: (result) => {
                    console.log(result);
                    setRecords(result.data);
                    setFileName(csv.name);
                    setLoading(
                        {
                            reading: {
                                start: true,
                                end: true
                            },
                            uploading: {
                                start: false,
                                end: false
                            },
                            deactivate: {
                                start: false,
                                end: false
                            }
                        }
                    )
                    setDpCount(0);
                    setNewCount(0);
                }
            })
        }
        fileInput.click()
    }


    const fetchOus = async () => {
        const { data, error } = await supabase.from("ous").select("*");
        if (error) {
            console.log(error);
        }
        console.log(data);
        setOus(data);
    }

    useEffect(() => { fetchOus() }, [])

    const uploadData = async () => {

        console.log(ou);
        setLoading((l) => ({
            ...l,
            reading: {
                start: true,
                end: false
            }
        }))
        const mappedData = [];
        for (let record of records) {
            mappedData.push({
                degree: record["Degree"],
                email_address: record["Email Address"],
                first_name: record["First Name"],
                gender: record["Gender"],
                ieee_status: record["IEEE Status"] == "Active" ? true : false,
                address: `${record["Address 1"]}, ${record["City"]}, ${record["State/Province"]}, ${record["Country"]}`,
                middle_name: record["Middle Name"],
                program: record["Program"],
                renew_year: record["Renew Year"],
                graduation_date: record["Proposed Graduation Date"],
                last_name: record["Last Name"],
                member_id: record["Member/Customer Number"],
                membership_type: record["Grade"]
            })
        }

        setLoading((l) => ({
            ...l,
            reading: {
                start: true,
                end: true
            },
            uploading: {
                start: true,
                end: false
            }
        }))

        let nCount = 0;

        if (ou == 1) {
            for (let record of mappedData) {
                const user = await supabase.from("users").select("member_id").eq("member_id", record.member_id);
                const member = await supabase.from("ou_member").select("member_id,ou_id").eq("member_id", record.member_id).eq("ou_id", ou);

                const elm = document.getElementById("count");
                let count = parseInt(elm.innerText);
                elm.innerText = count + 1;

                if (user?.data?.length === 0) {
                    const err = await supabase.from("users").insert(record);
                    console.log(err);
                    nCount++;
                }
                if (member?.data?.length === 0) {
                    await supabase.from("ou_member").insert({ ou_id: ou, member_id: record.member_id });
                }
            }



            setLoading((l) => ({
                ...l,
                uploading: {
                    start: true,
                    end: true
                },
                deactivate: {
                    start: true,
                    end: false
                }
            }))

            const users = await supabase.from("users").select("*");

            let dup_count = 0;
            let reactivated = 0;

            console.log(mappedData);

            const membersID = mappedData.map((record) => record.member_id);

            for (let user of users?.data) {

                const memberExsits = membersID.find((member_id) => member_id == user.member_id);


                if (memberExsits == undefined) {
                    await supabase.from("users").update({ ieee_status: false }).eq("member_id", user.member_id);
                    await supabase.from("ou_member").update({ active: false }).eq("member_id", user.member_id).eq("ou_id", ou);
                    dup_count++;
                }

                if (memberExsits != undefined && user.ieee_status == false) {
                    await supabase.from("users").update({ ieee_status: true }).eq("member_id", user.member_id);
                    await supabase.from("ou_member").update({ active: true }).eq("member_id", user.member_id).eq("ou_id", ou);
                    reactivated++;
                }
            }

            setLoading((l) => ({
                ...l,
                deactivate: {
                    start: true,
                    end: true
                }
            }))
            setNewCount(nCount);
            setDpCount({ dup_count, reactivated });

            return;
        }

        for (let record of mappedData) {
            const member = await supabase.from("ou_member").select("member_id,ou_id").eq("member_id", record.member_id).eq("ou_id", ou);

            if (member?.data?.length === 0) {
                await supabase.from("ou_member").insert({ ou_id: ou, member_id: record.member_id });
                nCount++;
            }

            const elm = document.getElementById("count");
            let count = parseInt(elm.innerText);
            elm.innerText = count + 1;
        }

        setLoading((l) => ({
            ...l,
            uploading: {
                start: true,
                end: true
            },
            deactivate: {
                start: true,
                end: false
            }
        }))

        const members = await supabase.from("ou_member").select("*").eq("ou_id", ou);

        let dup_count = 0;
        let reactivated = 0;

        for (let member of members?.data) {
            const memberExsits = mappedData.find((record) => {
                if (record.member_id == member.member_id) {
                    return member;
                }
            });
            if (memberExsits == undefined) {
                await supabase.from("ou_member").update({ active: false }).eq("member_id", member.member_id).eq("ou_id", ou);
                dup_count++;
            }
            if (memberExsits != undefined && member.active == false) {
                await supabase.from("ou_member").update({ active: true }).eq("member_id", member.member_id).eq("ou_id", ou);
                reactivated++;
            }
        }



    }



    return (
        <Card className="mt-1 p-4">
            <h1 className="text-2xl font-bold">Upload Member Details</h1>
            <div className="flex gap-4 mt-3">
                <Input placeholder="Filename" value={fileName} disabled size="sm" endContent={<Button onClick={onFileInput} isIconOnly radius="full" color="primary" variant="flat" ><UploadOutlined /></Button>} />
                <Select placeholder="Select Membership Type" size="sm"
                    onChange={(e) => setOu(e.target.value)}
                >
                    {
                        ous.map((ou) => (
                            <SelectItem key={ou.id} value={ou.id}>{ou.name}</SelectItem>
                        ))
                    }
                </Select>
                <div className="flex justify-center align-middle">
                    <Button color="primary" radius="sm" className="m-auto" onClick={uploadData} endContent={<UploadOutlined />}>Upload</Button>
                </div>
            </div>
            <div className="mt-4 w-96">

                {
                    loading.reading.start && (
                        <div className="flex gap-2">
                            {
                                loading.reading.end ? (
                                    <div className="flex justify-center align-middle text-center">
                                        <CheckOutlined style={{ fontSize: '.8rem', color: '#3bce74', textAlign: 'center', margin: 'auto', padding: 0 }} />
                                    </div>
                                ) : (
                                    <Spinner size="sm" color="success" />
                                )
                            }
                            <p className="font-light text-sm">Reading Data From CSV</p>
                        </div>
                    )
                }
                {
                    loading.uploading.start && (
                        <div className="flex gap-2">
                            {
                                loading.uploading.end ? (
                                    <div className="flex justify-center align-middle text-center">
                                        <CheckOutlined style={{ fontSize: '.8rem', color: '#3bce74', textAlign: 'center', margin: 'auto', padding: 0 }} />
                                    </div>
                                ) : (
                                    <Spinner size="sm" color="success" />
                                )
                            }
                            <p className="font-light text-sm">Uploading Data To Database {loading.deactivate.end ? (<>({newCount} Records Uploaded)</>) : (<>(<span id="count">0</span>/{records.length})</>)} </p>
                        </div>
                    )
                }
                {
                    loading.deactivate.start && (
                        <div className="flex gap-2">
                            {
                                loading.deactivate.end ? (
                                    <div className="flex justify-center align-middle text-center">
                                        <CheckOutlined style={{ fontSize: '.8rem', color: '#3bce74', textAlign: 'center', margin: 'auto', padding: 0 }} />
                                    </div>
                                ) : (
                                    <Spinner size="sm" color="success" />
                                )
                            }
                            <p className="font-light text-sm">Deactivating Inactive Members ({dpCount.dup_count} Memberships Deactivated, {dpCount.reactivated} Memberships Reactivated)</p>
                        </div>
                    )
                }
                {
                    loading.deactivate.end && (
                        <div className="flex gap-2">
                            <div className="flex justify-center align-middle text-center">
                                <CheckOutlined style={{ fontSize: '.8rem', color: '#3bce74', textAlign: 'center', margin: 'auto', padding: 0 }} />
                            </div>
                            <p className="font-light text-sm">{records.length} Records Uploaded Successfully</p>
                        </div>
                    )
                }

            </div>
        </Card>
    )
}

const PendingActivities = () => {

    const [pendingActivities, setPendingActivities] = useState([]);
    const [pendingEvaluation, setPendingEvaluation] = useState([]);
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    const getPendingActivities = async () => {
        const { data } = await supabase.from("projects").select("*").eq("score", 0);
        setPendingActivities(data);
    }

    const getPendingEvaluation = async () => {

        setLoading(true);
        const { data } = await supabase.from("projects").select("*");

        for (let project of data) {
            // Get the volunteers for the project
            const { data } = await supabase.from("volunteer_project").select("*,users(first_name,last_name)").eq("project_id", project.id);
            project.volunteers = data;
        }
        // Get the months in between the start date and end date of the project
        const pending = [];
        //Foreach volunteer in project get the score in month
        for (let project of data) {
            const months = await getMonthsBetweenDates(new Date(project.start_date), new Date(project.end_date))
                .filter(({ month, year }) => new Date(year, month) <= new Date())
                .map(({ month, year }) => `${getMonthName(month)} ${year}`);
            console.log(months);
            for (let volunteer of project.volunteers) {
                console.log(volunteer);
                for (let month of months) {
                    const { data, error } = await supabase.from("volunteer_project_evaluate").select("*").eq("volunteer_id", volunteer.volunteer_id).eq("project_id", volunteer.project_id).eq("month", month);
                    console.log(data);
                    console.log(error);
                    if (data.length == 0) {
                        pending.push({
                            project_id: volunteer.project_id,
                            project_name: project.name,
                            volunteer_id: volunteer.volunteer_id,
                            volunteer_name: `${volunteer.users.first_name} ${volunteer.users.last_name}`,
                            month: month
                        })
                    }
                }
            }

        }

        setLoading(false);

        setPendingEvaluation(pending);

    }

    useEffect(() => {
        getPendingActivities();
        getPendingEvaluation();
    }, [])

    return (
        <Card className="mt-1 p-4">
            <h1 className="text-2xl font-bold">Pending Activities</h1>
            <div className="flex gap-4 mt-3">
                <Table>
                    <TableHeader>
                        <TableColumn>Project ID</TableColumn>
                        <TableColumn>Project</TableColumn>
                        <TableColumn>Task</TableColumn>
                        <TableColumn>View</TableColumn>
                    </TableHeader>
                    <TableBody>
                        {
                            pendingActivities.map(project => (
                                <TableRow>
                                    <TableCell>{project.id}</TableCell>
                                    <TableCell>{project.name}</TableCell>
                                    <TableCell>
                                        <Chip color="warning" variant="flat">Pending Score</Chip>
                                    </TableCell>
                                    <TableCell>
                                        <div className="relative flex items-center gap-2">
                                            <Tooltip content="Details">
                                                <span className="text-lg text-default-400 cursor-pointer active:opacity-50">
                                                    <EyeTwoTone onClick={() => navigate(`../dashboard/projects/${project.id}`)} />
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

            <h1 className="text-2xl font-bold mt-5">Pending Evaluation</h1>
            <div className="flex gap-4 mt-3">
                <Table>
                    <TableHeader>
                        <TableColumn>Project ID</TableColumn>
                        <TableColumn>Project Name</TableColumn>
                        <TableColumn>Volunteer ID</TableColumn>
                        <TableColumn>Volunteer Name</TableColumn>
                        <TableColumn>Pending Evaluation Month</TableColumn>
                        <TableColumn>View</TableColumn>
                    </TableHeader>
                    <TableBody
                        isLoading={loading}
                        loadingContent={<Spinner />}

                    >
                        {
                            pendingEvaluation.map(project => (
                                <TableRow>
                                    <TableCell>{project.project_id}</TableCell>
                                    <TableCell>{project.project_name}</TableCell>
                                    <TableCell>{project.volunteer_id}</TableCell>
                                    <TableCell>{project.volunteer_name}</TableCell>
                                    <TableCell>{project.month}</TableCell>
                                    <TableCell>
                                        <div className="relative flex items-center gap-2">
                                            <Tooltip content="Details">
                                                <span className="text-lg text-default-400 cursor-pointer active:opacity-50">
                                                    <EyeTwoTone onClick={() => navigate(`../dashboard/projects/${project.project_id}`)} />
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