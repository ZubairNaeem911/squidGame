import { React, useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RELOAD_POPUP_TRUE, RELOAD_POPUP_FALSE } from "../../redux/actionType";

const Timer = (props) => {
  const contractData = useSelector((state) => state.contract);
  const [remain, setRemain] = useState(0);
  const [remainFormateed, setRemainFormateed] = useState(0);
  const [timerCheck,setTimerCheck] = useState(true);
  let dispatch = useDispatch();
  console.log("TESTING DATA>>>>>>>>",contractData.latestTimestampOfUsers > contractData?.gameEndDays,contractData?.gameEndDays)

  useEffect(() => {
    let interval;
    interval = setInterval(setRemaningSlotTime, 1000);

    return () => {
      clearInterval(interval);
    };
  }, [contractData.contractInstance, contractData.globalStage]);

  useEffect(() => {
    if (remain > 0) {
      timeFormatterFunction();
    }
  }, [remain]);

  const timeFormatterFunction = () => {
    let scnds = remain % 60;
    let minutes = parseInt(remain / 60);
    let minutesActual = minutes % 60;
    let hours = parseInt(minutes / 60);
    setRemainFormateed(
      `${hours} Hours - ${minutesActual} Minutes - ${scnds} Seconds`
    );
  };

  const setRemaningSlotTime = () => {
    const startTime = contractData.startGameTime;
    if (startTime !== 0 && startTime < Math.floor(Date.now() / 1000)) {
      const slot = process.env.REACT_APP_TIMESLOT;
      const currentTime = Math.floor(Date.now() / 1000);
      let remaningTime = (currentTime - startTime) % slot;
      remaningTime = slot - remaningTime;
      if (
        remaningTime ==
        slot - 2
      ) {
       
        if (
          contractData.latestTimestampOfUsers > contractData?.gameEndDays ||
          (contractData?.isHybridEnd === false &&
            contractData.gameInitializeDay !== 0 &&
            contractData?.safetiles[contractData?.globalStage - 2] !== undefined && contractData?.winningDayEnd == true
            )
        ) {
         
          dispatch({
            type: RELOAD_POPUP_FALSE,
            payload: false,
          });
        }
        else {

            dispatch({
              type: RELOAD_POPUP_TRUE,
              payload: true,
            });
          }
      } 

      setRemain(remaningTime);
    } else {
      setRemain(0);
    }
  };
  return (
    <div className="out-timer">
      {
      contractData.latestTimestampOfUsers > contractData?.gameEndDays ||
      (contractData?.isHybridEnd === false &&
        contractData.gameInitializeDay !== 0 &&
        contractData?.safetiles[contractData?.globalStage - 1] !== undefined && contractData?.winningDayEnd == true)
        ? "Game Ended"
        : remain
        ? remainFormateed
        : "Game not started yet"}
    </div>
  );
};

export default Timer;
