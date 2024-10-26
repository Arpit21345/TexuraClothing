import './List.css'
import axios from 'axios'
import { useEffect,useState } from 'react'
import { toast } from 'react-toastify'


const List = () => {

  const url = "http://localhost:4000"
  const [list,setlist] = useState([]);
  const fetchList = async () => {
    const response = await axios.get(`${url}/api/food/list`);
    console.log(response.data);
    
    if (response.data.success){
      setlist(response.data.data)
    }
    else{
      toast.error("Error in Listing or Fetching")
    }
  }
  useEffect(()=>{
    fetchList();
  },[])
  return (
    <div>
      
    </div>
  )
}

export default List
