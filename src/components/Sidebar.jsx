import CIcon from '@coreui/icons-react';
import * as icon from '@coreui/icons';
import { Button, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader } from "@nextui-org/react"
import { HomeOutlined, UserOutlined, createFromIconfontCN } from '@ant-design/icons';
import Logo from '../assets/logo.png';
import routes from '../util/routes';
import { useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import supabase from '../supabase/client';
import { useUserStore } from '../util/store';
const IconFont = createFromIconfontCN({
    scriptUrl: '//at.alicdn.com/t/font_8d5l8fzk5b87iudi.js',
});

export default () => {

    const [open, setOpen] = useState(false);
    const navigate = useNavigate();

    const user = useUserStore(state=>state.user);

    const loading = useUserStore(state=>state.loading);

    if(loading){
        return <></>
    }

    return (
        <div className="w-[20%] bg-[#07020d] h-screen top-0 sticky text-[#9b9ba4]">
            <div className="w-[90%] m-auto h-5/6">
                <div className="flex items-center">
                    <img src={Logo} className='w-10 mt-5 mb-2  h-10 rounded-full' />
                </div>
                <div>
                    {
                        routes.map(({ Icon, name, path,allowed }, index) => {
                           const allowedAccess = allowed.includes(user?.account_type);
                           return allowedAccess && <SideBarIcon key={index} path={path} name={name} Icon={<Icon style={{ fontSize: "25px" }} width={25} height={25} />} />
                        }
                        )
                    }
                </div>


            </div>
            <div className="flex h-1/6 w-[90%] mx-auto"  >
                <Button color='danger' className="w-full m-auto" variant='flat' onClick={setOpen} >Logout</Button>
            </div>
            <Modal isOpen={open} onClose={setOpen} >
                <ModalContent>
                    {
                        (onClose) => (
                            <>
                                <ModalHeader>Logout</ModalHeader>
                                <ModalBody>
                                    <p>Are you sure you want to logout?</p>

                                </ModalBody>
                                <ModalFooter>
                                    <div className="flex justify-end gap-3">
                                        <Button color='danger' className="w-1/2" variant='flat' onClick={()=>{
                                            supabase.auth.signOut();
                                            navigate('/login');
                                        }} >Yes</Button>
                                        <Button color='success' className="w-1/2" variant='flat' onClick={setOpen} >No</Button>
                                    </div>
                                </ModalFooter>

                            </>
                        )
                    }

                </ModalContent>
            </Modal>
        </div>
    )
}


function SideBarIcon({ name, Icon, path, active }) {

    const navigate = useNavigate();
    const { pathname } = useLocation();
    const isCurrentRoute = (pathname.split('/')[3] == path.split('/')[1]);
    return (
        <div onClick={() => navigate(`dashboard${path}`)} className={`flex items-center w-full m-auto p-2 my-4 rounded-lg transition ease-in-out hover:cursor-pointer  hover:bg-[#27272a] border-[#27272a] ${isCurrentRoute && 'bg-[#27272a] border-[#27272a]'}  hover:border-1`}  >
            <p className='flex items-start ml-1'>
                {Icon}
            </p>
            <p className='flex ml-3 items-end font-semibold'>
                {name}
            </p>

        </div>
    )
}