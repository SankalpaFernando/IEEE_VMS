import { LeftCircleTwoTone, RightCircleTwoTone } from "@ant-design/icons";
import { BreadcrumbItem, Breadcrumbs, Card, CardBody, CardHeader, Code, Popover, PopoverContent, PopoverTrigger, Spinner } from "@nextui-org/react";
import moment from "moment";
import { useEffect, useState } from "react";
import supabase from "../supabase/client";

export default () => {

    const [days, setDays] = useState([]);
    const [month, setMonth] = useState(new Date().getMonth());
    const [year, setYear] = useState(new Date().getFullYear());
    const [isLoading, setIsLoading] = useState(false);

    const getDaysInMonth = async () => {

        setIsLoading(true);
        const start = new Date(year, month, 1);
        const end = new Date(year, month + 1, 1);

        const day_ = [];

        for (let day = start; day < end; day.setDate(day.getDate() + 1)) {

            const events = await getEventsByDate(moment(`${year}-${month + 1}-${day.getDate()}`).format("YYYY-MM-DD"));

            day_.push({
                date: new Date(day),
                events
            });
        }

        setDays(day_);
        setIsLoading(false);
    }

    useEffect(() => {
        
        getDaysInMonth()
    }, [month,year])

    const previousMonth = () => {
        if (month == 0) {
            setYear(year - 1)
            setMonth(11)
            return;
        }
        setMonth(month - 1)
    }

    const nextMonth = () => {
        if (month == 11) {
            setYear(year + 1)
            setMonth(0)
            return;
        }
        setMonth(month + 1)
    }

    const getEventsByDate = async (date) => {
        const { data, error } = await supabase.from('events').select('*,projects(*)').eq('date', date)
        if (error) {
            console.log(error);
            return null;
        }

        return data;
    }


    return (
        <div className="w-[90%] m-auto">
            <Breadcrumbs className="mt-4">
                <BreadcrumbItem href="/">Home</BreadcrumbItem>
                <BreadcrumbItem href="/volunteer">Projects</BreadcrumbItem>
            </Breadcrumbs>

            <Card className="mt-4 p-4">

                <div className="">
                    <h1 className="text-2xl font-bold">Event Calendar</h1>

                    <div className="flex justify-between my-6">


                        <div className="flex items-center">
                            <LeftCircleTwoTone style={{ fontSize: '1.3rem' }} onClick={previousMonth} />
                        </div>
                        <div className="">
                            <h1 className="text-xl font-semibold"> {moment(`${year}-${month + 1}-1`).format("MMMM")} </h1>
                            <h1 className="text-md text-center font-light">{year}</h1>
                        </div>
                        <div className="flex items-center">
                            <RightCircleTwoTone style={{ fontSize: '1.3rem' }} onClick={nextMonth} />
                        </div>

                    </div>
                    {
                            !isLoading ?  ( <div className="grid grid-cols-5 2xl:grid-cols-7 mt-4">
                                    {
                                        days.map(({ date, events }) => {
                                            return (
                                                <div className="w-full h-36 border-1">
                                                    <h1 className="m-1">{date.getDate()}</h1>
            
                                                    <div>
                                                        {
                                                            events.map((event) => (
                                                                <Popover>
                                                                    <PopoverTrigger>
                                                                        <Code  color="warning" className="w-4/5 mx-2 my-1 hover:cursor-pointer">{event.name}</Code>
                                                                    </PopoverTrigger>
                                                                    <PopoverContent>
                                                                        <Card shadow="none" className="max-w-[300px] border-none bg-transparent">
                                                                            <CardHeader className="justify-between">
                                                                                <div className="flex gap-3">
                                                                                    <div className="flex flex-col items-start justify-center">
                                                                                        <h4 className="text-small  "> <span className="font-semibold leading-none text-default-600">Event:</span>  {event.name}</h4>
                                                                                        <h4 className="text-small  "> <span className="font-semibold leading-none text-default-600">Project:</span>  {event.projects.name}</h4>
                                                                                        <h4 className="text-small  "> <span className="font-semibold leading-none text-default-600">Time:</span>  {event.start_time} - {event.end_time}</h4>
                                                                                    </div>
                                                                                </div>
                                                                            </CardHeader>
                                                                            <CardBody className="px-3 py-0">
            
                                                                            </CardBody>
            
                                                                        </Card>
                                                                    </PopoverContent>
                                                                </Popover>
                                                            ))
                                                        }
                                                    </div>
            
                                                </div>
            
                                            )
                                         })
                                    }
                                </div>)
                             : (
                                <div className="w-full flex justify-center items-center">
                                    <Spinner/>
                                </div>
                             )
                    

                        }
                  
                </div>
            </Card>



        </div>
    )
}