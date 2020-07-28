const express =require('express');
const bodyParser = require('body-parser');
const bcrypt=require('bcrypt-nodejs');
const session = require('express-session');
const saltRounds = 10;
var salt = bcrypt.genSaltSync(saltRounds);

const knex = require('knex')({
  client: 'pg',
  connection: {
    host : 'ec2-54-228-250-82.eu-west-1.compute.amazonaws.com',
    user : 'mzvjnaozpxwtfk',
    password : '3757d997fd4a7655b9a9245b215a276e1b77d5ea788d4ea2f69fdba7dea51bbf',
    database : 'd90jt7bg9i2gh7',
    ssl: 'off'
  }
});

/*knex.select('*').from('users').then(data=>{
	console.log(data);
});*/

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
     	res.redirect("/Invalid.html");
	}
	})
     .catch(err=>res.redirect("/Invalid.html"))
});

app.post('/register',(req,res)=>{
	const email =req.body.email;
	const Firstname=req.body.Firstname;
	const Lastname=req.body.Lastname;
	const password=req.body.Password;
	const gender=req.body.gender;
	const mobile_number=req.body.mobile;

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
	
	 .catch(err=>res.status(404).json(err));

  


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
		knex.select('firstname','comment').from('comment').then(comment=>{

		res.render('comment.ejs', {comment:comment})
		})
	    }
	    else{
	    res.status(400).json('not found');
	}
	})}
	 else{knex.select('firstname','comment').from('comment').then(comment=>{

		res.render('comment.ejs', {comment:comment})
		})}
	


})
app.post('/comment',(req,res)=>{
	
	
    sess = req.session;	
    if(sess.email){
    knex.select(
    	'id','firstname','email'
     )
   .from('users')
   .where('email', sess.email)
   .then(user=>{ 
         knex('comment')
			   .insert({ 
				   comment: req.body.comment,
			       id:user[0].id,
			       firstname:user[0].firstname,
			       email:user[0].email      
			    })
			   .then(user=>{
					res.redirect("/post-images");
				})
			  
  	})

}
else { res.redirect("/signin");}
}
)


app.listen(3000)