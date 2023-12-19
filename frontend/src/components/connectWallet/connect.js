import React from "react"
import { useDispatch, useSelector } from "react-redux";
import Dropdown from 'react-bootstrap/Dropdown';
import { MetamaskConnection } from '../../redux/connectWallet/action'
import { toast } from "react-toastify";

const Connect = (props) => {
    const dispatch = useDispatch();
    // const [isDisabled, setisDisabled] = useState(false)
    const contractData = useSelector((state) => state.contract);

    const reloadFunction = () => {
        window.location.reload()
    }

    const accountRequest = async () => {
        try{
            await window.ethereum.request({
                method: "wallet_requestPermissions",
                params: [{
                    eth_accounts: {}
                }]
            }).then(() => window.ethereum.request({
                method: 'eth_requestAccounts'
            }).then(reloadFunction())
            )
        }
        catch(error){
            toast.error("Error in Metamask Connection")
        }
        
    }
    
    return (
        <>

            {contractData.signerWallet !== "" ?
            
                <Dropdown>
                    <Dropdown.Toggle className="btn-connect"  id="dropdown-basic" 
                >
                        {contractData.signerWallet.slice(0, 4) + "....." + contractData.signerWallet.slice(38, 43)}
                                       
                    </Dropdown.Toggle>

                    <Dropdown.Menu>
                        <Dropdown.Item onClick={accountRequest}>Account Change</Dropdown.Item>
                        {/* <Dropdown.Item onClick={reloadFunction}>Disconnect</Dropdown.Item> */}
                        {/* <Dropdown.Item href="#/action-3">Something else</Dropdown.Item> */}
                    </Dropdown.Menu>
                </Dropdown> :
                <button className="btn-connect" onClick={() => {
                    dispatch(MetamaskConnection())
                }}
                    
                >
                 Connect 
                </button>
            }
        </>
    )
}

export default Connect