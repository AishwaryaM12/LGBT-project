const express =require('express');
const bodyParser = require('body-parser');
const bcrypt=require('bcrypt-nodejs');
const session = require('express-session');
const saltRounds = 10;
var salt = bcrypt.genSaltSync(saltRounds);
const knex = require('knex')({
  client: 'pg',
  connection: {
    host : '127.0.0.1',
    user : 'postgres',
    password : 'test',
    database : 'lgbt'
  }
});

knex.select('*').from('users').then(data=>{
	console.log(data);
});

const app =express();


app.use(session({secret: 'ssshhhhh',saveUninitialized: true,resave: true}));
app.use(express.static(__dirname+'/public'));
app.set('view engine', 'ejs');

var sess;

app.get('/',function(req,res){
	sess=req.session;
    if(sess.email) {
        return res.redirect('/admin');
    }
    res.sendFile("Home.html",{root:__dirname+"/public"});
});


app.get('/admin',(req,res) => {
    sess = req.session;
    if(sess.email) {
        res.sendFile("admin.html",{root:__dirname+"/public"});
        
    }
    else {
        res.write('<h1>Please login first.</h1>');
        res.end('<a href='+'/'+'>Login</a>');
    }
});

app.get('/logout',(req,res) => {
    req.session.destroy((err) => {
        if(err) {
            return console.log(err);
        }
        res.redirect('/');
    });

});




app.use(bodyParser.urlencoded({
	extended: true
}));

app.get('/register',(req,res)=>{
	res.sendFile("Signup.html",{root:__dirname+"/public"});
});


app.use(bodyParser.json());

app.get('/',(req,res)=>{
	
	res.sendFile("Home.html",{root:__dirname+"/public"});
});


app.get('/signin',(req,res)=>{
	
	res.sendFile("login.html",{root:__dirname+"/public"});
})

app.post('/signin',(req,res)=>{
	var password = req.body.password;
	sess = req.session;
    sess.email = req.body.email;
   
	knex.select('email','hash').from('login')
	.where('email','=',req.body.email)
	.then(data=>{
	 
     const isValid=bcrypt.compareSync(req.body.password,data[0].hash);
       
     
     if(isValid){
     	return knex.select('*').from('users')
     	.where('email','=', req.body.email)
     	.then(user=>{
     		res.redirect('/');
     	
     	})
     	.catch(err=>res.status(400).json('unable to getElementBy user'))
     }else{
     res.status(400).json('wrong credentials')
	}
	})
     .catch(err=>res.status(400).json('wrong credentials'))
});

app.post('/register',(req,res)=>{
	const email =req.body.email;
	const Firstname=req.body.Firstname;
	const Lastname=req.body.Lastname;
	const password=req.body.Password;
	const gender=req.body.gender;
	const mobile_number=req.body.mbno;
	
	const hash =bcrypt.hashSync(password,salt);
	
	knex.transaction(trx=>{
		trx.insert({
			hash:hash,
			email:email   
		})
		.into('login')		
		.returning('email')
		.then(loginemail=>{
			return trx('users')
		    .returning('*')
			.insert({
				email:loginemail[0],
				firstname:Firstname,
				lastname:Lastname,
				gender: gender,
				mobile_number:mobile_number
			})
			.then(user=>{
				res.redirect("/signin");
				
			})
           
		}).then(trx.commit)
		.catch(trx.rollback)
	 })
	
	 .catch(err=>res.status(404).json('unable to register'));

  


});

app.get('/profile',(req,res)=>{
    sess = req.session;	
   if(sess.email){
	knex.select('firstname','lastname','email','gender').from('users').where({email:sess.email}).then(user=>{
		
		if(user.length){
		res.render('profile.ejs', {firstname:user[0].firstname,lastname:user[0].lastname,email:user[0].email,gender:user[0].gender})
	    }
	    else{
	    res.status(400).json('not found');
	}
	})}
	 else{
	    res.status(400).json('not found');}
	
});
app.get('/post-images',(req,res)=>{
     sess = req.session;	
   if(sess.email){
	knex.select('firstname').from('users').where({email:sess.email}).then(user=>{
	
		if(user.length){
		res.render('comment.ejs', {firstname:user[0].firstname})
		
	    }
	    else{
	    res.status(400).json('not found');
	}
	})}
	 else{
	    res.status(400).json('not found');}
	

})
app.post('/post-images',(req,res)=>{
	console.log(req.body);
	const comment=req.body.comment;
    sess = req.session;	
    if(sess.email){
    knex.select(
    	'id','firstname','email'
     )
   .from('users')
   .where('email', sess.email)
   .then(user=>{
         return 
         knex('comment')
			   .insert({ 
				   comment:comment,
			       id:'2',
			       firstname:'user[0].firstname',
			       email:'user[0].email'      
			    })
			   .then(user=>{
			   		console.log(2);
					res.redirect("/");
				})
			  
  	})

}
}
)
app.get('/post',(req,res)=>{
     res.sendFile("comment2.html",{root:__dirname+"/public"})
	

})
app.post('/image',(req,res)=>{
	const {id}=req.body;
	let found=false;
	database.users.forEach(user =>{
		found=true; 
		user.entries++;
		return res.json(user.entries);
		}
	)
	if(!found){
		res.status(404).json('notfound');
	}
})

app.listen(3000, ()=>{

	console.log('app is running');
})