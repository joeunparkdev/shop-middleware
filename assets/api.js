// const socket = io.connect("/");

// socket.on("BUY_GOODS", function (data) {
//   const { nickname, goodsId, goodsName, date } = data;
//   makeBuyNotification(nickname, goodsName, goodsId, date);
// });

function initAuthenticatePage() {
  // socket.emit("CHANGED_PAGE", `${location.pathname}${location.search}`);
}

function bindSamePageViewerCountEvent(callback) {
  // socket.on("SAME_PAGE_VIEWER_COUNT", callback);
}

function postOrder(user, order) {
  if (!order.length) {
    return;
  }

  // socket.emit("BUY", {
  //   nickname: user.nickname,
  //   goodsId: order[0].goods.goodsId,
  //   goodsName:
  //     order.length > 1
  //       ? `${order[0].goods.name} 외 ${order.length - 1}개의 상품`
  //       : order[0].goods.name,
  // });
}

function getSelf(callback) {
  // 1. 로컬 스토리지에서 토큰 가져오기
  const token = localStorage.getItem("token");

  // 2. 토큰이 없을 경우 로그인 필요 알림 등의 처리
  if (!token) {
    alert("로그인이 필요합니다.");
    window.location.href = "/"; // 로그인 페이지로 이동
    return;
  }

  // 3. 서버에 사용자 정보 요청
  $.ajax({
    type: "GET",
    url: "/api/users/me",
    headers: {
      authorization: `Bearer ${token}`,
    },
    success: function (response) {
      // 4. 성공적으로 사용자 정보를 받아왔을 때
      console.log("성공 응답:", response);
      callback(response.user);
    },
    error: function (xhr, status, error) {
      // 5. 서버 응답에서 에러가 발생한 경우
      console.error("에러:", xhr, status, error);

      if (status == 401) {
        // 6. 토큰이 만료되었을 경우 로그인 필요 알림 등의 처리
        alert("로그인이 필요합니다.");
      } 
      if (status == 404) {
        // 7. 그 외의 에러인 경우
        //localStorage.clear();
        console.log(error);
        alert("알 수 없는 문제가 발생했습니다. 관리자에게 문의하세요.");
      }

      // 8. 로그인 페이지로 리다이렉트
      window.location.href = "/";
    },
  });
}



function getGoods(category, callback) {
  $("#goodsList").empty();
  $.ajax({
    type: "GET",
    url: `/api/goods${category ? "?category=" + category : ""}`,
    headers: {
      authorization: `Bearer ${localStorage.getItem("token")}`,
    },
    success: function (response) {
      callback(response["goods"]);
    },
  });
}

function signOut() {
  localStorage.clear();
  window.location.href = "/";
}

function getGoodsDetail(goodsId, callback) {
  $.ajax({
    type: "GET",
    url: `/api/goods/${goodsId}`,
    headers: {
      authorization: `Bearer ${localStorage.getItem("token")}`,
    },
    error: function (xhr, status, error) {
      if (status == 401) {
        alert("로그인이 필요합니다.");
      } else if (status == 404) {
        alert("존재하지 않는 상품입니다.");
      } else {
        alert("알 수 없는 문제가 발생했습니다. 관리자에게 문의하세요.");
      }
      window.location.href = "/goods";
    },
    success: function (response) {
      callback(response.goods);
    },
  });
}

function makeBuyNotification(targetNickname, goodsName, goodsId, date) {
  const messageHtml = `${targetNickname}님이 방금 <a href="/detail.html?goodsId=${goodsId}" class="alert-link">${goodsName}</a>을 구매했어요! <br /><small>(${date})</small>
    <button type="button" class="close" data-dismiss="alert" aria-label="Close">
        <span aria-hidden="true">&times;</span>
    </button>`;
  const alt = $("#customerAlert");
  if (alt.length) {
    alt.html(messageHtml);
  } else {
    const htmlTemp = `<div class="alert alert-sparta alert-dismissible show fade" role="alert" id="customerAlert">${messageHtml}</div>`;
    $("body").append(htmlTemp);
  }
}

function addToCart(goodsId, quantity, callback) {
  $.ajax({
    type: "PUT",
    url: `/api/goods/${goodsId}/cart`,
    headers: {
      authorization: `Bearer ${localStorage.getItem("token")}`,
    },
    data: {
      quantity,
    },
    error: function (xhr, status, error) {
      if (status == 400) {
        alert("존재하지 않는 상품입니다.");
      }
      window.location.href = "/goods.html";
    },
    success: function () {
      callback();
    },
  });
}

function buyLocation(params) {
  sessionStorage.setItem("ordered", JSON.stringify(params));
  location.href = "order.html";
}

function getCarts(callback) {
  $.ajax({
    type: "GET",
    url: `/api/goods/cart`,
    headers: {
      authorization: `Bearer ${localStorage.getItem("token")}`,
    },
    success: function (response) {
      callback(response.cart);
    },
  });
}

function deleteCart(goodsId, callback) {
  $.ajax({
    type: "DELETE",
    url: `/api/goods/${goodsId}/cart`,
    headers: {
      authorization: `Bearer ${localStorage.getItem("token")}`,
    },
    success: function () {
      callback();
    },
  });
}
