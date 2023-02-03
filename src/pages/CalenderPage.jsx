import { useState, useEffect } from "react";
import { Layout } from "../components/Home/Home";
import Calendar from "react-calendar";
import "./Calender.css";
import { Modal, Button, Container } from "react-bootstrap";
import Toggle from "react-toggle";
import "./Toggle.css";
import { db, storage } from "../firebse/config";
import {
  collection,
  setDoc,
  Timestamp,
  query,
  orderBy,
  onSnapshot,
  doc,
  getDoc,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import ClipLoader from "react-spinners/ClipLoader";
import axios from "axios";

const days = {
  0: "Sunday",
  1: "Monday",
  2: "Tuesday",
  3: "Wednesday",
  4: "Thursay",
  5: "Friday",
  6: "Saturday",
};
const CalenderPage = () => {
  const [today, setToday] = useState("");
  const [isSubmit, setIsSubmit] = useState(true);
  const [show, setShow] = useState(false);
  const [day, setDay] = useState(new Date(today));
  const maxDate = new Date(today);
  const minDate = new Date(today);
  maxDate.setDate(maxDate.getDate() + 6);
  minDate.setDate(minDate.getDate());
  const [specialFoodDate, setSpecialFoodDate] = useState("2022-10-24");
  useEffect(() => {
    const fetchDate = async () => {
      const response = await axios(
        "http://localhost:8000/api/get-date"
        // "http://worldtimeapi.org/api/timezone/Asia/Kolkata"
      ).then((response) => {
        setToday(response.data);
      });
    };
    fetchDate();
    const q = query(
      collection(db, "special_food"),
      orderBy("createdAt", "desc")
    );

    let unsubscribe = onSnapshot(q, (snapshot) => {
      let [date] = snapshot.docs.map((doc) => doc.data().date);

      setSpecialFoodDate(date);
    });
    return unsubscribe;
  }, []);

  const open = (e) => {
    setShow(true);
    setDay(e);
    let selectedDate = `${day.getDate()}/${
      day.getMonth() + 1
    }/${day.getFullYear()}`;
  };

  return (
    <>
      <Layout pageRoute="Men's Hostel / Food">
        {today ? (
          <Calendar
            className="mx-auto"
            onClickDay={open}
            onChange={setDay}
            value={new Date(specialFoodDate)}
            maxDate={maxDate}
            minDate={minDate}
          />
        ) : (
          <div
            style={{
              display: "flex",
              height: "100vh",
              width: "100%",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <ClipLoader size={70} color="#000" />
          </div>
        )}
        <Pop
          open={open}
          show={show}
          setShow={setShow}
          day={day}
          isSubmit={isSubmit}
          setIsSubmit={setIsSubmit}
        />
      </Layout>
    </>
  );
};

function Pop({ show, setShow, day, isSubmit }) {
  const { user } = useContext(AuthContext);
  // console.log(user);
  const handleClose = () => {
    setShow(false);
    setTimeout(() => setIstick((prev) => false), 250);
  };
  const [istick, setIstick] = useState(false);
  const [foodData, setFoodData] = useState({
    morning: true,
    noon: true,
    night: true,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const getData = async () => {
      if (!show) return;
      let dateString = `${day.getFullYear()}-${String(
        day.getMonth() + 1
      ).padStart(2, "0")}-${String(day.getDate()).padStart(2, "0")}`;
      const docRef = doc(db, dateString, user.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setFoodData((prev) => docSnap.data().foodData);
        setIstick(true);
      } else {
        setFoodData((prev) => ({
          morning: true,
          noon: true,
          night: true,
        }));
        setIstick(true);
      }
    };
    getData();
  }, [show]);
  //console.log(foodData);

  const handleSubmit = async (day, foodData) => {
    setLoading(true);
    let dateString = `${day.getFullYear()}-${String(
      day.getMonth() + 1
    ).padStart(2, "0")}-${String(day.getDate()).padStart(2, "0")}`;
    console.log(dateString);
    const { email, uid, name } = user;

    setDoc(doc(db, dateString, uid), {
      day: dateString,
      foodData,
      email,
      name,
      createdAt: Timestamp.now(),
    }).finally(() => {
      setLoading(false);
      setShow(false);
      setTimeout(() => setIstick((prev) => false), 250);
    });
  };

  return (
    <>
      <Modal
        show={show}
        onHide={handleClose}
        backdrop="static"
        keyboard={false}
        size="md"
        aria-labelledby="contained-modal-title-vcenter"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title className="mx-3">
            Select time for {day.getDate()}/{day.getMonth() + 1}/
            {day.getFullYear()} - {days[day.getDay()]}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <FoodList
            istick={istick}
            foodData={foodData}
            setFoodData={setFoodData}
            day={day}
          />
        </Modal.Body>
        <Modal.Footer>
          {isSubmit && (
            <Button
              style={{
                minWidth: "100px",
              }}
              onClick={() => handleSubmit(day, foodData)}
              className="px-auto"
              variant="outline-success"
            >
              {loading ? <ClipLoader size={20} color="#fff" /> : "Submit"}
            </Button>
          )}
        </Modal.Footer>
      </Modal>
    </>
  );
}

const FoodList = ({ foodData, setFoodData, istick, day }) => {
  const [today, setToday] = useState("");
  const checkHour = (disableHour, clickDate) => {
    const now = new Date(today);
    if (now.getHours() >= disableHour && now.getDate() === clickDate) {
      return true;
    } else return false;
  };

  const checkHourMrng = (disableHour, clickDate) => {
    const now = new Date(today);
    if (now.getDate() === clickDate) return true;
    if (now.getDate() === clickDate - 1 && now.getHours() >= disableHour) {
      return true;
    } else return false;
  };

  useEffect(() => {
    const fetchDate = async () => {
      const response = await axios(
        "http://localhost:8000/api/get-date"
        // "http://worldtimeapi.org/api/timezone/Asia/Kolkata"
      ).then((response) => {
        // console.log(response.data.datetime);
        setToday(response.data);
        // setToday(response.data.datetime);
      });
    };
    fetchDate();
  }, []);
  return (
    <>
      {istick && today ? (
        <Container>
          {
            <Toggler
              disabled={checkHourMrng(21, day.getDate())}
              foodData={foodData.morning}
              setFoodData={(value) =>
                setFoodData((prev) => ({ ...prev, morning: value }))
              }
              title="MORNING"
            />
          }

          {
            <Toggler
              disabled={checkHour(0, day.getDate())}
              foodData={foodData.noon}
              setFoodData={(value) =>
                setFoodData((prev) => ({ ...prev, noon: value }))
              }
              title="NOON"
            />
          }

          {
            <Toggler
              disabled={checkHour(10, day.getDate())}
              foodData={foodData.night}
              setFoodData={(value) =>
                setFoodData((prev) => ({ ...prev, night: value }))
              }
              title="NIGHT"
            />
          }
        </Container>
      ) : (
        <div
          style={{
            minHeight: "190px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <ClipLoader size={100} color={"#fc03e3"} />
        </div>
      )}
    </>
  );
};

const Toggler = ({ title, foodData, setFoodData, disabled }) => {
  const [check, setCheck] = useState(foodData);
  const handleToggle = (changeObj) =>
    setCheck((prev) => changeObj.target.checked);
  useEffect(() => {
    setFoodData(check);
  }, [check]);

  return (
    <>
      <div className="d-flex justify-content-between px-1 my-3">
        <h3 style={{ color: "#ff00d6", letterSpacing: 2.5, margin: 0 }}>
          {title}
        </h3>
        <label className="d-flex align-items-center">
          <Toggle
            disabled={disabled}
            defaultChecked={foodData}
            icons={false}
            onChange={handleToggle}
          />
        </label>
      </div>
      <hr />
    </>
  );
};

export default CalenderPage;
