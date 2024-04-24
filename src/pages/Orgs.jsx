import { EyeFilled, EyeTwoTone, KubernetesOutlined, RedoOutlined, SearchOutlined } from "@ant-design/icons";
import { BreadcrumbItem, Breadcrumbs, Button, Card, Input, Spinner, Table, TableBody, TableCell, TableColumn, TableHeader, TableRow, Tooltip } from "@nextui-org/react"
import supabase from "../supabase/client";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default () => {

    const [ous, setOus] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();





    const fetchOUs = async () => {
        setIsLoading(true)
        const { data, error } = await supabase.from('ous').select(
            'id,short_name,name'
        );

        if (error) {
            console.log(error);
            return;
        }

        for (let ou of data) {
            const active = (await supabase.from('ou_member').select('*', { count: 'exact' }).eq('ou_id', ou.id).eq('active', true))
            const inactive = (await supabase.from('ou_member').select('*', { count: 'exact' }).eq('ou_id', ou.id).eq('active', false))

            data.find((o) => o.id == ou.id).memeber_count = active.count;
            data.find((o) => o.id == ou.id).inactive_count = inactive.count;

        }
        setIsLoading(false)
        setOus(data);
    }

    useEffect(() => {
        fetchOUs();
    }, []);



    return (
        <div className="w-[90%] m-auto">
            <Breadcrumbs className="mt-4">
                <BreadcrumbItem href="../">Home</BreadcrumbItem>
                <BreadcrumbItem href="../ous">Organization Units</BreadcrumbItem>
            </Breadcrumbs>

            <Card className="mt-4 p-4">
                <h1 className="text-2xl font-semibold my-2">Organization Units</h1>

                <div className="mt-4">
                    <Table


                    >
                        <TableHeader>
                            <TableColumn>OU ID</TableColumn>
                            <TableColumn>Organisational Unit Name</TableColumn>
                            <TableColumn>Organistion Unit Short Name</TableColumn>
                            <TableColumn align="center">Active Membership Count</TableColumn>
                            <TableColumn >Inactive Membership Count</TableColumn>
                            <TableColumn>Actions</TableColumn>
                        </TableHeader>
                        <TableBody
                        loadingContent={<Spinner />}
                        isLoading={isLoading}
                        >
                            {ous.map((ou, index) => (
                                <TableRow key={index}>
                                    <TableCell>{ou.id}</TableCell>
                                    <TableCell>{ou.name}</TableCell>
                                    <TableCell>{ou.short_name}</TableCell>
                                    <TableCell align="center">{ou.memeber_count}</TableCell>
                                    <TableCell>{ou.inactive_count}</TableCell>
                                    <TableCell>
                                        <div className="relative flex items-center gap-2">
                                            <Tooltip content="Details">
                                                <span className="text-lg text-default-400 cursor-pointer active:opacity-50 hover:text-primary">
                                                    <EyeTwoTone onClick={() => navigate(`${ou.id}`)} />
                                                </span>
                                            </Tooltip>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </Card>
        </div>

    )
}


