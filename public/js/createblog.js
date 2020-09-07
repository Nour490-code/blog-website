const title = document.getElementById('title');
const description = document.getElementById('description');
const body = document.getElementById('body');
const form = document.getElementById('form')
const titleErr = document.querySelector('.title');
const descriptionErr = document.querySelector('.description')
const bodyErr = document.querySelector('.body')



form.addEventListener('submit',async (e) => {
    e.preventDefault()
    
    titleErr.textContent = '';
    descriptionErr.textContent = '';
    bodyErr.textContent = ''
    
    try{
        const result = await fetch('/createblog',{
            method:"POST",
            body: JSON.stringify({
                title: title.value,
                description: description.value,
                body: body.value
            }),
            headers: {'Content-Type':"application/json"}
        });
        const data = await result.json();
        console.log(data)
        if (title.value === '') {
            titleErr.textContent = 'Please Enter A Title';
        }else if(description.value === ''){
            descriptionErr.textContent = 'Please Enter A description';
        }else if(body.value === ''){
            bodyErr.textContent = 'Please Enter A Body';
        }
        else{
            location.assign('/dashboard');
        }
    }catch (err){
        console.log(err)
    }
})