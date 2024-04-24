import { BreadcrumbItem, Breadcrumbs, Card, Chip, Table, TableBody, TableCell, TableColumn, TableHeader, TableRow } from "@nextui-org/react"
import { useUserStore } from "../util/store"
import { BarChartOutlined } from "@ant-design/icons"
import { getCustomGreeting } from "../util/util"
import supabase from "../supabase/client"
import { useEffect, useMemo, useState } from "react"

export default ()=>{

    const user = useUserStore(state => state.user)
    const [topVolunteer,setTopVolunteer] = useState([])
    const [rank,setRank] = useState(0)
    const [associatedProjects,setAssociatedProjects] = useState([])

    const getAssociatedProjects = async()=>{
        const {data} = await supabase.from('volunteer_project').select('*,projects(*)').eq('volunteer_id',user.member_id)
        console.log(data)
        setAssociatedProjects(data)
    }
    

    const getTopVolunteers = async()=>{
        const {data} = await supabase.from('users').select('*').order('score',{ascending:false}).neq('score',0).limit(3)
        setTopVolunteer(data)
    }

    const getRank = async()=>{
        const {data} = await supabase.from('users').select('*').order('score',{ascending:false})

        console.log(data) 
        console.log(user)

        const rank = data.findIndex((volunteer)=>volunteer.member_id == user.member_id) + 1

    
        setRank(rank)
    }

    useEffect(()=>{
        getTopVolunteers()
        getRank()
        getAssociatedProjects()
    },[])

    return (
        <div className="w-[90%] m-auto">
            <h1 className="mt-4 py-4 text-2xl font-bold">{getCustomGreeting(user?.first_name)}</h1>
            <div className="grid grid-cols-3 gap-4">
                {/* Stat Card */}
                <Card className="w-[100%] p-4">
                    <div className="flex justify-between">
                        <div className="flex flex-col">
                        <h1 className="text-xl font-light text-gray-500">Associated Projects</h1>
                        <h1 className="text-3xl font-bold">{associatedProjects.length}</h1>
                        </div>
                    <BarChartOutlined/>
                    </div>
                </Card>
                {/* Stat Card */}
                <Card className="w-[100%] p-4">
                    <div className="flex justify-between">
                        <div className="flex flex-col">
                        <h1 className="text-xl font-light text-gray-500">Current Rank</h1>
                        <h1 className="text-3xl font-bold">{rank}</h1>
                        </div>
                    <BarChartOutlined/>
                    </div>
                </Card>
                {/* Stat Card */}
                <Card className="w-[100%] p-4">
                    <div className="flex justify-between">
                        <div className="flex flex-col">
                        <h1 className="text-xl font-light text-gray-500">Current Score</h1>
                        <h1 className="text-3xl font-bold">{user?.score}</h1>
                        </div>
                    <BarChartOutlined/>
                    </div>
                </Card>

                <Card className="w-[100%] p-4" style={{gridColumnStart:1,gridColumnEnd:3}}>
                    <h1 className="text-xl font-light mb-3">Recent Activities</h1>
                    <Table>
                        <TableHeader>
                            <TableColumn>Project</TableColumn>
                            <TableColumn>Role</TableColumn>
                            <TableColumn>Status</TableColumn>
                        </TableHeader>
                        <TableBody>
                            {
                                associatedProjects.map(({projects,role})=>(
                                    <TableRow>
                                        <TableCell>{projects?.name}</TableCell>
                                        <TableCell>{role}</TableCell>
                                        <TableCell>
                                            <Chip color={projects?.status==='active'?'success':'danger'} variant="flat">{projects?.status}</Chip>
                                        </TableCell>
                                    </TableRow>
                                ))
                            }
                        </TableBody>
                    </Table>

                </Card>
                <Card className="w-[100%] p-4">
                    <h1 className="text-xl font-light mb-3">Top Volunteers</h1>
                    <div>
                        <div className="flex gap-2 my-2">
                            <div className="flex justify-center align-middle text-center ">
                                <img src="https://cdn-icons-png.flaticon.com/512/5406/5406819.png" className="w-10 h-10 rounded-full" />
                            </div>
                            <div>
                               <h2 className="font-medium text-medium">{
                                      topVolunteer[0]?.first_name + " " + topVolunteer[0]?.last_name
                               }</h2>
                               <p className="text-sm font-light">
                                      {
                                        topVolunteer[0]?.member_id
                                      }
                               </p>
                            </div>
                        </div>
                        <div className="flex gap-2 my-2">
                            <div className="flex justify-center align-middle text-center ">
                                <img src="https://cdn-icons-png.flaticon.com/512/5406/5406816.png" className="w-10 h-10 rounded-full" />
                            </div>
                            {
                                topVolunteer[1] &&
                                <div>
                                    <h2 className="font-medium text-medium">
                                        {
                                            topVolunteer[1]?.first_name + " " + topVolunteer[1]?.last_name
                                        }
                                    </h2>
                                    <p className="text-sm font-light">
                                        {
                                            topVolunteer[1]?.member_id
                                        }
                                    </p>
                                </div>
                            }
                        </div>
                        <div className="flex gap-2 my-2">
                            <div className="flex justify-center align-middle text-center ">
                                <img src="https://cdn-icons-png.flaticon.com/512/5406/5406812.png" className="w-10 h-10 rounded-full" />
                            </div>
                           {
                                 topVolunteer[2] &&
                                 <div>
                                      <h2 className="font-medium text-medium">
                                        {
                                             topVolunteer[2]?.first_name + " " + topVolunteer[2]?.last_name
                                        }
                                      </h2>
                                      <p className="text-sm font-light">
                                        {
                                             topVolunteer[2]?.member_id
                                        }
                                      </p>
                                 </div>
                           }
                        </div>
                    </div>
                </Card>

            </div>
            
        </div>
    )
}