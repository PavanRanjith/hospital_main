import React, {useEffect} from 'react'
import { useNavigate } from 'react-router-dom';
import swal2 from 'sweetalert2';
const Logout = () => {

    const Navigate = useNavigate();
    useEffect(()=>{
        fetch('http://localhost:4000/logout1',{
            method: "GET",
            headers:{
                Accept: "application/json",
                "Content-Type":"application/json"
            },
            credentials: "include"
        }).then((res)=>{
            swal2.fire({
                position: 'top-end',
                title: 'Logged Out !',
                timer: 2000,
                timerProgressBar: true,
                customClass: {
                  popup: 'my-custom-popup-class',
                  title: 'my-custom-title-class',
                  content: 'my-custom-content-class',
                  timerProgressBar:'progress-bar',
                },
                didOpen: () => {
                  swal2.showLoading();
                  const b = swal2.getHtmlContainer().querySelector('b');
                  timerInterval = setInterval(() => {
                    b.textContent = swal2.getTimerLeft();
                  }, 100);
                },
                }).then((result) => {
                if (result.dismiss === swal2.DismissReason.timer) {
                  console.log('I was closed by the timer');
                }
                }); 
            Navigate("/",{replace:true});
            if(res.status !== 200){
                const error = new Error(res.error);
                throw error;
            }
        }).catch((err)=>{
            console.log(err);
        });
    });

  return(
      <>
      <section><h3>ONE MOMENT PLEASE !!!</h3></section>
      </>
  )
}

export default Logout