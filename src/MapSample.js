import React from 'react';
import GoogleMapReact from 'google-map-react';
import Button from 'react-bootstrap/Button';
import Alert from 'react-bootstrap/Alert';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import 'bootstrap/dist/css/bootstrap.min.css';

const MapSample = () => {

    const initErrorMsg = React.useRef({ msg: "", isShow: false })

    const [errorMsg, setErrorMsg] = React.useState(initErrorMsg.current);

    const [mapDefaultProps, setMapDefaultProps] = React.useState({
        key: "", 
        zoom: 12,
        //預設地址為 台北101
        center: {
            lat: 25.0338041,
            lng: 121.5645561
        }
    });

    // 位置資訊
    const [myPositionInfo, setMyPositionInfo] = React.useState({
        lat: "",
        lng: "",
        address: ""
    })

    const [mapApiLoaded, setMapApiLoaded] = React.useState(false);
    const [mapInstance, setMapInstance] = React.useState(null);
    const [mapApi, setMapApi] = React.useState(null);
    // 記錄先前的marker
    const prevMarkerRef = React.useRef([]);

    const mapOption = (maps) => {
        return {
            streetViewControl: true,
            scrollwheel: false,  //是否允許使用者對地圖物件使用滑鼠滾輪
            mapTypeId: "roadmap",
            zoomControl: true, //縮放地圖
            zoomControlOptions: {
                position: maps.ControlPosition.TOP_RIGHT
            },
            mapTypeControl: true, //地圖類型
            mapTypeControlOptions: {
                style: maps.MapTypeControlStyle.DROPDOWN_MENU
            }
        }
    }

    /**
     * 當地圖載入完成，將地圖實體與地圖 API 傳入 state 供之後使用
     * @param {*} map 
     * @param {*} maps 
     * @returns 
     */
    const apiHasLoaded = (map, maps) => {
        let marker = new maps.Marker({
            position: { lat: map.center.lat(), lng: map.center.lng() },
            map
        });
        prevMarkerRef.current = marker;

        setMapInstance(map);
        setMapApi(maps);
        setMapApiLoaded(true);

        return marker;
    };

    /**
     * 根據xy找地點
     * @param {*} x 
     * @param {*} y 
     */
    const findLocationByXY = async (x, y) => {
        if (mapApiLoaded) {
            if (x != "" && y != "") {
                //移除當下位置的marker
                prevMarkerRef.current.setMap(null);

                let marker = new mapApi.Marker({
                    position: { lat: parseFloat(x), lng: parseFloat(y) },
                    map: mapInstance
                });

                prevMarkerRef.current = marker;

                let markerPosition = marker.getPosition();
                let geocoder = new mapApi.Geocoder();
                geocoder.geocode({ 'latLng': markerPosition }, (results, status) => {
                    if (status === mapApi.GeocoderStatus.OK) {
                        if (results) {

                            mapInstance.setCenter(markerPosition);

                            let address = results[0].formatted_address;

                            setMyPositionInfo({
                                ...myPositionInfo,
                                address: address,
                                lat: x,
                                lng: y
                            });
                        }
                    }
                })
            } else {
                setErrorMsg({ msg: "請先輸入經緯度！", isShow: true })
            }
        }
    }

    /**
     * 根據地址找地點
     * @param {*} addr 
     * @param {*} props 
     */
    const findLocationByAddr = (addr) => {
        if (mapApiLoaded) {
            let geocoder = new mapApi.Geocoder();
            geocoder.geocode({ 'address': addr }, (results, status) => {
                if (status === mapApi.GeocoderStatus.OK) {
                    let lat = results[0].geometry.location.lat();
                    let lng = results[0].geometry.location.lng();

                    //移除當下位置的marker，避免maker上一個marker還顯示在地圖上
                    prevMarkerRef.current.setMap(null);

                    let marker = new mapApi.Marker({
                        position: { lat, lng },
                        map: mapInstance
                    });

                    prevMarkerRef.current = marker;

                    let markerPosition = marker.getPosition();
                    mapInstance.setCenter(markerPosition);

                    setMyPositionInfo({
                        ...myPositionInfo,
                        lat: lat,
                        lng: lng
                    });
                } else {
                    setErrorMsg({ msg: "查無經緯度！", isShow: true })
                }
            })
        }
    }

    /**
     * 移動地圖邊界時觸發event
     */
    const handleCenterChange = () => {
        if (mapApiLoaded) {
            let lat = mapInstance.center.lat();
            let lng = mapInstance.center.lng();

            findLocationByXY(lat, lng);
        }
    }

    /**
     * input change event
     * @param {*} e 
     * @param {*} field 
     */
    const inputChange = (e, field) => {
        setMyPositionInfo({
            ...myPositionInfo,
            [field]: e.target.value
        })
    }

    return (
        <>
            <Container style={{ margin: "20px auto", width: "60%" }} >
                <Row style={{ marginBottom: "10px" }}>
                    <Col style={{ textAlign: "center", fontWeight: "bold", fontSize: "30px" }}>
                        Google Map Sample
                    </Col>
                </Row>
                <Row>
                    <Col>
                        {errorMsg.isShow &&
                            <Alert variant={"danger"}
                                onClose={() => setErrorMsg(initErrorMsg.current)} dismissible>
                                {errorMsg.msg}
                            </Alert>}
                    </Col>
                </Row>
                <Row style={{ marginBottom: "10px" }}>
                    <Col >
                        x座標：
                    </Col>
                    <Col lg={3}>
                        <Form.Control type="text" name="xcoord" value={myPositionInfo.lat}
                            onChange={(e) => inputChange(e, "lat")} />
                    </Col>
                    <Col >
                        y座標：
                    </Col>
                    <Col lg={3}>
                        <Form.Control type="text" name="ycoord" value={myPositionInfo.lng}
                            onChange={(e) => inputChange(e, "lng")} />
                    </Col>
                    <Col style={{ textAlign: "right" }}>
                        <Button variant="outline-secondary" onClick={() => findLocationByXY(myPositionInfo.lat, myPositionInfo.lng)}>查詢地標</Button>
                    </Col>
                </Row>
                <Row style={{ marginBottom: "10px" }}>
                    <Col>
                        請輸入地址：
                    </Col>
                    <Col lg={8}>
                        <Form.Control type="text" name="address" value={myPositionInfo.address}
                            onChange={(e) => inputChange(e, "address")} />
                    </Col>
                    <Col style={{ textAlign: "right" }}>
                        <Button variant="outline-secondary" onClick={() => findLocationByAddr(myPositionInfo.address)}>查詢地標</Button>
                    </Col>
                </Row>
                <Row style={{ height: '450px' }}>
                    <GoogleMapReact
                        bootstrapURLKeys={{ key: mapDefaultProps.key }}
                        options={mapOption}
                        defaultCenter={mapDefaultProps.center}
                        defaultZoom={mapDefaultProps.zoom}
                        yesIWantToUseGoogleMapApiInternals // 設定為 true
                        onGoogleApiLoaded={({ map, maps }) => apiHasLoaded(map, maps)}
                        // 移動地圖邊界時觸發 handleCenterChange
                        onBoundsChange={handleCenterChange}
                    />
                </Row>
            </Container>
        </>
    );
}

export default MapSample;