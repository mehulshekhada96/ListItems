
    async function changeUserRole() {
      const res = await fetch("/change-user-role", {
        method: "PUT",
        body: JSON.stringify({
           role : role
        }),
        headers: {
          "Content-type": "application/json; charset=UTF-8",
        },
      });
    
      console.log(res);
      console.log(res.response);
    }