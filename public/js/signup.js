const fullname = document.getElementById('fullname'); 
        const email = document.getElementById('email');
        const pass = document.getElementById('pass');
        const form = document.getElementById('form')
        const emailErr = document.querySelector('.email');
        const passErr = document.querySelector('.pass')
        const nameErr = document.querySelector('.fullname')

        form.addEventListener('submit',async (e) => {
            e.preventDefault()
            
            emailErr.textContent = '';
            passErr.textContent = '';
            nameErr.textContent = '';
            
            try{
                const result = await fetch('/signup',{
                    method:"POST",
                    body: JSON.stringify({
                        email: email.value,
                        password: pass.value,
                        fullname: fullname.value
                    }),
                    headers: {'Content-Type':"application/json"}
                });
                const data = await result.json();
                console.log(data)
                if (data.errs) {
                    emailErr.textContent = data.errs.email;
                    passErr.textContent = data.errs.password;
                }
                if (data.user) {
                    location.assign('/dashboard');
                }
            }catch (err){
                console.log(err)
            }
        })