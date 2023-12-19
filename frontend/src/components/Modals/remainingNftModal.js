import React, { useState } from "react";

import {  useSelector } from "react-redux";

const RemainingNftModal = (props) => {
  const [show, setshow] = useState(true);

  const contractData = useSelector((state) => state.contract);
  
  let leftarray = [];
  let dieArray = [];

  const handleClose = () => {
    setshow(false);
  };

  return (
    <div className={`died-nfts-wrapper  ${show ? "show" : ""}`}>
      <div className="nft-header">
        <h3>NFT Stats</h3>
       
      </div>

      <div className="nft-stats">
        {
          props.allUsers && props.allUsers.length > 0 &&
            props.allUsers.map((data, i) => {
               data.map((usersData) => {
                if (i == 0) {
                  leftarray.push(usersData);
                }
                if (
                  i !== 0 && (i == contractData?.globalStage &&
                  contractData?.safetiles[i - 1]?.safeTile == undefined) 
                  || (i >  contractData?.globalStage) 
                ) {
                 
                  leftarray.push(usersData);
                }

                if (
                  (usersData.lastJumpSide == true &&
                    contractData?.safetiles[i - 1]?.safeTile !== undefined &&
                    contractData?.safetiles[i - 1]?.safeTile >= 50) ||
                  (usersData.lastJumpSide == false &&
                    contractData?.safetiles[i - 1]?.safeTile !== undefined &&
                    contractData?.safetiles[i - 1]?.safeTile < 50)
                ) {
                 
                  leftarray.push(usersData);
                }
                if (
                  (usersData.lastJumpSide == true &&
                    contractData?.safetiles[i - 1]?.safeTile !== undefined &&
                    contractData?.safetiles[i - 1]?.safeTile < 50) ||
                  (usersData.lastJumpSide == false &&
                    contractData?.safetiles[i - 1]?.safeTile !== undefined &&
                    contractData?.safetiles[i - 1]?.safeTile >= 50)
                ) {
                 
                  dieArray.push(usersData);
                }
              });
            })

       
        }
        <p> Safe NFTs : {leftarray.length} </p>
        <p> Dead NFTs : {dieArray.length} </p>
      </div>
    </div>
  );
};

export default RemainingNftModal;
