// 마커를 담을 배열입니다
var markers = [];

// Kakao Maps API 로드 후 실행될 함수
kakao.maps.load(() => {

const container = document.getElementById('map');
const options = {
    center: new kakao.maps.LatLng(37.611035490773, 126.99457310622), // 지도의 중심좌표
    level: 3, // 지도의 확대 레벨
};
const map = new kakao.maps.Map(container, options);

// 장소 검색 객체를 생성합니다
var ps = new kakao.maps.services.Places();

// 검색 결과 목록이나 마커를 클릭했을 때 장소명을 표출할 인포윈도우를 생성합니다
var infowindow = new kakao.maps.InfoWindow({zIndex:1});

const searchButton = document.getElementById('searchButton');
searchButton.addEventListener("click", function() {
    searchPlaces();
    console.log('장소를 탐색합니다.');
});

// 키워드 검색을 요청하는 함수입니다
function searchPlaces() {

    var keyword = document.getElementById('keyword').value;

    if (!keyword.replace(/^\s+|\s+$/g, '')) {
        alert('키워드를 입력해주세요!');
        return false;
    }

    // 장소검색 객체를 통해 키워드로 장소검색을 요청합니다
    ps.keywordSearch(keyword, placesSearchCB);
}

// 장소검색이 완료됐을 때 호출되는 콜백함수 입니다
function placesSearchCB(data, status, pagination) {
    if (status === kakao.maps.services.Status.OK) {

        // 정상적으로 검색이 완료됐으면
        // 검색 목록과 마커를 표출합니다
        displayPlaces(data);

        // 페이지 번호를 표출합니다
        displayPagination(pagination);

    } else if (status === kakao.maps.services.Status.ZERO_RESULT) {

        alert('검색 결과가 존재하지 않습니다.');
        return;

    } else if (status === kakao.maps.services.Status.ERROR) {

        alert('검색 결과 중 오류가 발생했습니다.');
        return;

    }
}

// 사용자가 추가한 장소 리스트와 마커 리스트
let logList = [];
let selectedMarker = []

// 검색 결과 목록과 마커를 표출하는 함수입니다
function displayPlaces(places) {
    var listEl = document.getElementById('placesList'), 
    menuEl = document.getElementById('menu_wrap'),
    fragment = document.createDocumentFragment(), 
    bounds = new kakao.maps.LatLngBounds(), 
    listStr = '';
    
    // 검색 결과 목록에 추가된 항목들을 제거합니다
    removeAllChildNods(listEl);

    // 지도에 표시되고 있는 마커를 제거합니다
    removeMarker();

    for (var i = 0; i < places.length; i++) {
        (function () {
            let place = places[i];
            let placePosition = new kakao.maps.LatLng(place.y, place.x);
            let marker = addMarker(placePosition, i);
            let itemEl = getListItem(i, place);
    
            bounds.extend(placePosition);
    
            // 이벤트 처리기 함수들 내에서 사용할 지역 변수들을 클로저로 감쌉니다.
            kakao.maps.event.addListener(marker, 'mouseover', function () {
                displayInfowindow(marker, place.place_name);
            });
    
            kakao.maps.event.addListener(marker, 'mouseout', function () {
                infowindow.close();
            });
    
            kakao.maps.event.addListener(marker, "click", function () {
                if (!logList.some(selectedPlace => selectedPlace === place)) {
                    changeMarker(placePosition, marker);
                    console.log("마커가 변경됐습니다");
                    getLogItem(place, placePosition);
                    console.log("마이로그에 장소가 추가됐습니다");
                } else {
                    // ---------------delButton을 누른 것과 같은 효과를 내면 좋을 것 같음-------------
                    alert("이미 추가된 장소입니다.");
                }
            });
    
            itemEl.onmouseover = function () {
                displayInfowindow(marker, place.place_name);
            };
    
            itemEl.onmouseout = function () {
                infowindow.close();
            };
    
            // save 버튼을 누르면 마이로그에 해당 장소가 추가되며, 그 장소의 마커가 선택 마커로 바뀜
            var saveButtons = itemEl.querySelectorAll(".saveButtons");
            saveButtons.forEach(saveButton => {
                saveButton.addEventListener("click", function () {
                    if (!logList.some(selectedPlace => selectedPlace === place)) {
                        // 마이로그에 장소 추가
                        getLogItem(place, placePosition);
                        // 선택한 장소에 마커 표시
                        changeMarker(placePosition, marker);
                    } else {
                        alert("이미 추가된 장소입니다.");
                    }
                });
            });
    
            fragment.appendChild(itemEl);
        })();
    }
    
    // 검색결과 항목들을 검색결과 목록 Element에 추가합니다
    listEl.appendChild(fragment);
    menuEl.scrollTop = 0;

    // 검색된 장소 위치를 기준으로 지도 범위를 재설정합니다
    map.setBounds(bounds);
}

// 검색결과 항목을 Element로 반환하는 함수입니다
function getListItem(index, places) {

    let el = document.createElement('li'),
    itemStr = '<span class="markerbg marker_' + (index + 1) + '"></span>' +
                '<div class="info">' +
                '   <h3>' + places.place_name + '</h3>';

    if (places.road_address_name) {
        itemStr += '    <span>' + places.road_address_name + '</span>' +
                    '   <span class="jibun gray">' +  places.address_name  + '</span>';
    } else {
        itemStr += '    <span>' +  places.address_name  + '</span>'; 
    }

    itemStr += '  <span class="tel">' + places.phone  + '</span>'; 
    itemStr += '   <button class="saveButtons">save</button>' +
                '</div>';

    el.innerHTML = itemStr;
    el.className = 'item';

    return el;
}

let originMarkers = [];

// save 버튼 누르면 기본 마커에서 선택 마커로 대체되는 함수
function changeMarker(position, originMarker) {
    // 선택 마커 정보
    let imageSrc = 'https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/marker_red.png';    
    let imageSize = new kakao.maps.Size(64, 69);
    let imageOption = {offset: new kakao.maps.Point(27, 69)};
    // 선택 마커 이미지 생성
    let selectedMarkerImg = new kakao.maps.MarkerImage(imageSrc, imageSize, imageOption);
    // 선택 마커 생성
    let marker = new kakao.maps.Marker({
        position:  position,
        image: selectedMarkerImg
    });

    originMarkers.push(originMarker);
    originMarker.setImage(selectedMarkerImg);
    selectedMarker.push(originMarker);

    console.log("마커가 변경됐습니다!");

    return marker;
}

let selectedMarkerIndex = 0;

// save 버튼을 눌렀을 때 MyLog 페이지에 추가되는 함수
function getLogItem(places, position) {
    logList.push(places);
    console.log(logList[logList.length - 1]);

    // 검색된 장소 위치를 기준으로 지도 범위를 재설정하기위해
    // LatLngBounds 객체에 좌표를 추가합니다
    let bounds = new kakao.maps.LatLngBounds()
    bounds.extend(position);

    const mylogList = document.querySelector('#mylogList');
    const item = document.createElement('li');
    let itemStr = `<img src="/images/red_pin_marker.png" alt="" width="50px">`
                + `<div class="info">`
                +`  <h3>${places.place_name}</h3>`;
    if (places.road_address_name) {
        itemStr += `  <span>${places.road_address_name}</span>`
                +  `  <span class="jibun gray">${places.address_name}</span>`;
    } else {
        itemStr += `  <span class="gray">${places.address_name}</span>`;
    }
    itemStr += `  <span class="tel">${places.phone}</span>`
            +  `  <button class="delButton" data-marker-index="${selectedMarkerIndex}">Deleted</button>`
            +  `</div>`;

    item.innerHTML = itemStr;
    item.className = 'logItem';
    mylogList.appendChild(item);
    selectedMarkerIndex++;

    const delButtons = document.querySelectorAll(".delButton");

    for (let delButton of delButtons) {
        delButton.addEventListener("click", function () {
            const address = this.parentNode.querySelector('.gray').textContent;
            logList = logList.filter(place => place.address_name !== address);

            this.parentNode.parentNode.remove(this.parentNode);
            console.log(`주소가 ${address}인 장소가 삭제됐습니다!`);

            // 해당 버튼에 연결된 마커 인덱스 찾기
            const markerIndex = parseInt(this.getAttribute("data-marker-index"));
            // 해당 장소의 선택 마커를 기본 마커로 다시 대체
            removeSelectedMarker(markerIndex);
            console.log("마커가 삭제됐습니다!")
            // 마커 인덱스 업데이터
            updateMarkerIndices(markerIndex);
            if (selectedMarkerIndex <= 0) {
                selectedMarkerIndex = 0;
            } else selectedMarkerIndex--;
        });
    }

    console.log("마이로그에 장소가 추가됐습니다!");
}

// 어떤 장소가 삭제되면 나머지 장소의 인덱스 업데이트
function updateMarkerIndices(startIndex) {
    const delButtons = document.querySelectorAll(".delButton");
    for (let i = startIndex + 1; i < delButtons.length; i++) {
        delButtons[i].setAttribute("data-marker-index", i - 1);
    }
    console.log("마커 인덱스가 업데이트됐습니다!");
    // 갱신된 삭제 버튼들의 인덱스 출력
    delButtons.forEach(button => {
        console.log(`장소: ${button.parentNode.querySelector('h3').textContent}, 마커 인덱스: ${button.getAttribute("data-marker-index")}`);
    });
}

// 마커를 생성하고 지도 위에 마커를 표시하는 함수입니다
function addMarker(position, idx, title) {
    let imageSrc = 'https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/marker_number_blue.png', // 마커 이미지 url, 스프라이트 이미지를 씁니다
        imageSize = new kakao.maps.Size(36, 37),  // 마커 이미지의 크기
        imgOptions =  {
            spriteSize : new kakao.maps.Size(36, 691), // 스프라이트 이미지의 크기
            spriteOrigin : new kakao.maps.Point(0, (idx*46)+10), // 스프라이트 이미지 중 사용할 영역의 좌상단 좌표
            offset: new kakao.maps.Point(13, 37) // 마커 좌표에 일치시킬 이미지 내에서의 좌표
        },
        markerImage = new kakao.maps.MarkerImage(imageSrc, imageSize, imgOptions),
            marker = new kakao.maps.Marker({
            position: position, // 마커의 위치
            image: markerImage 
        });

    marker.setMap(map); // 지도 위에 마커를 표출합니다
    markers.push(marker);  // 배열에 생성된 마커를 추가합니다

    return marker;
}

// 지도 위에 표시되고 있는 마커 모두 제거. 단 사용자가 체크한 마커는 그대로 유지
function removeMarker() {
    for ( let i = 0; i < markers.length; i++ ) {
        if (selectedMarker.includes(markers[i])) {
            markers.splice(i, 1);
            i--;
        }
        else markers[i].setMap(null);
    }
    markers = [];
}

// 검색결과 목록 하단에 페이지번호를 표시는 함수입니다
function displayPagination(pagination) {
    var paginationEl = document.getElementById('pagination'),
        fragment = document.createDocumentFragment(),
        i; 

    // 기존에 추가된 페이지번호를 삭제합니다
    while (paginationEl.hasChildNodes()) {
        paginationEl.removeChild (paginationEl.lastChild);
    }

    for (i=1; i<=pagination.last; i++) {
        var el = document.createElement('a');
        el.href = "#";
        el.innerHTML = i;

        if (i===pagination.current) {
            el.className = 'on';
        } else {
            el.onclick = (function(i) {
                return function() {
                    pagination.gotoPage(i);
                }
            })(i);
        }

        fragment.appendChild(el);
    }
    paginationEl.appendChild(fragment);
}

// 검색결과 목록 또는 마커를 클릭했을 때 호출되는 함수입니다
// 인포윈도우에 장소명을 표시합니다
function displayInfowindow(marker, title) {
    var content = '<div style="padding:5px;z-index:1;">' + title + '</div>';

    infowindow.setContent(content);
    infowindow.open(map, marker);
}

 // 검색결과 목록의 자식 Element를 제거하는 함수입니다
function removeAllChildNods(el) {   
    while (el.hasChildNodes()) {
        el.removeChild (el.lastChild);
    }
}

// 경로선
let polylines = [];

// 경로 생성 버튼을 누르면 makeRoad 함수 호출
const makeRoadButton = document.querySelector('#makeRoadButton');
makeRoadButton.addEventListener("click", function() {
    // 경로 생성
    makeRoad(logList);
    console.log("경로가 성공적으로 생성됐습니다!")
})

// logList에 있는 장소들의 경로 생성 함수
async function makeRoad(logList) {
    const REST_API_KEY = '9449a0dc6863899dff5a90c6616e8528';
    const url = 'https://apis-navi.kakaomobility.com/v1/directions';

    // 요청 헤더
    const headers = {
        Authorization: `KakaoAK ${REST_API_KEY}`,
        'Content-Type': 'application/json'
    };

    // 출발지
    const origin = {
        x: logList[0].x,
        y: logList[0].y
    };

    // 도착지
    const destination = {
        x: logList[logList.length - 1].x,
        y: logList[logList.length - 1].y
    };

    // 중간 경유지
    const waypoints = logList.slice(1, logList.length - 1).map(place => {
        return {
            x: place.x,
            y: place.y
        };
    });

    // 중간 경유지를 문자열로 변환
    const waypointsString = waypoints.map(waypoint => `${waypoint.x},${waypoint.y}`).join('|');

    const queryParams = new URLSearchParams({
        origin: `${origin.x},${origin.y}`,
        destination: `${destination.x},${destination.y}`,
        waypoints: waypointsString
    });
    

    const requestUrl = `${url}?${queryParams}`;

    try {
        const response = await fetch(requestUrl, {
            method: 'GET',
            headers: headers
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();

        console.log(data.routes)

        const lineColors = ['#FF0000', '#00FF00', '#0000FF'];
        const linePath = [];

        deletePolyline();

        data.routes[0].sections.forEach((section, colorIndex) => {
            section.roads.forEach(router => {
                router.vertexes.forEach((vertex, index) => {
                    // 인덱스가 짝수인 경우에만 linePath에 추가
                    if (index % 2 === 0) {
                        linePath.push(new kakao.maps.LatLng(router.vertexes[index + 1], router.vertexes[index]));
                    }
                });
                const polylineColor = lineColors[colorIndex % lineColors.length];
                let newPolyline = new kakao.maps.Polyline({
                    path: linePath, 
                    strokeWeight: 5, 
                    strokeColor: polylineColor,
                    strokeOpacity: 0.7,
                    strokeStyle: 'solid'
                });
                newPolyline.setMap(map);
                polylines.push(newPolyline);
            })
            linePath.splice(0, linePath.length);
        })

    } catch (error) {
        console.error("Error:", error);
    }
}

// polyline 삭제 함수
function deletePolyline() {
    if (polylines.length !== 0) {
        polylines.forEach(polyline => {
            polyline.setMap(null);
        })
        polylines = [];
        console.log("경로가 성공적으로 삭제됐습니다!");
    } else {
        console.log("경로가 설정되어 있지 않습니다.")
    }
}

// 선택한 장소의 마커를 기본 마커로 되돌리는 함수
function removeSelectedMarker(index) {
    selectedMarker[index].setMap(null);
}

const resetButton = document.querySelector('#reset');
resetButton.addEventListener("click", function() {
    reset();
    console.log("초기화됐습니다.")
})

// 초기화 버튼을 누르면 경로, 마커 모두 삭제됨
function reset() {
    // 경로 삭제
    deletePolyline();
    // 선택 마커 삭제
    if (selectedMarker[0]) {
        for (let i = 0; i < selectedMarker.length; ++i) {
            removeSelectedMarker(i);
        }
        selectedMarkerIndex = 0;
    }
    // logList에 있는 장소 제거
    let logEl = document.getElementById('mylogList');
    removeAllChildNods(logEl);
    // placesList 내부에 있는 장소 제거
    let listEl = document.getElementById('placesList');
    removeAllChildNods(listEl);
    // 기본 마커 삭제
    removeMarker();
    // 검색창 비우기
    document.getElementById('keyword').value = ' ';
}
});