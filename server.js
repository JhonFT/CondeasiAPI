var express = require('express');
var app = express();
const pg = require('pg');
const bodyParser = require('body-parser');
var config = "postgres://Jfonseca:root@localhost/condeasi";

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true}));

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header('Access-Control-Allow-Methods', "POST, GET, PUT, DELETE");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

var getUser = "SELECT * FROM usuarios WHERE dsusuario = $1 AND dsclave = $2;";


app.post('/', function (req, res, next) {

  pg.connect(config, function(err, client, done){

  	if(err){
  		return console.log('erro fetcghing client from poll', err);
  	}
  	client.query(getUser,[req.body.user,req.body.pass],function(err, result){
  		if(err){
  			return console.log('Error Run Query', err);
  		}
  		done();
  		
  		res.send(result.rows.length > 0 ? JSON.stringify(result.rows) : JSON.stringify(false));
  	});
  });
});


var sqlDocenteId = "SELECT nextval('docentes_cddocente_seq')";
var insertDocente = "INSERT INTO public.docentes(cddocente, dsnombre, dsapellido, dstipo_documento, dsnumero_documento, fenacimiento) VALUES ($1, $2, $3, $4, $5, $6);";
var insertUsuario = "INSERT INTO public.usuarios(cddocente, cdrol, dsusuario, dsclave, snestado) VALUES ($1, $2, $3, $4, $5);";
app.post('/docente', function (req, res, next) {
  pg.connect(config, function(err, client, done){
    if(err){
      return console.log('erro fetcghing client from poll', err);
    }



    var docenteId = null;

    client.query(sqlDocenteId,function(err, result){
        if(err){
          return console.log('Error Run Query', err);
        }

        done();

        if(result.rows.length > 0){
          docenteId = result.rows[0].nextval;
          client.query(insertDocente,[docenteId, req.body.nombre,req.body.apellido, req.body.tipodoc, req.body.numdoc, '10-09-1995'],function(err, result){
            if(err){
              return console.log('Error Run Query', err);
            }
            done();
            console.log(result);
          });
         client.query(insertUsuario,[docenteId,1,req.body.usuario, req.body.clave,true],function(err, result){
          if(err){
            return console.log('Error Run Query', err);
          }
          done();
          console.log(result);
        });
      }
    });
  });
});

var inserEstudiante = "INSERT INTO public.estudiantes(dsnombre, dsapellido, dstipo_documento, dsnumero_documento, dscodigo) VALUES ($1, $2, $3, $4, $5);";
app.post('/estudiante', function (req, res, next) {
  console.log(res.body);
  pg.connect(config, function(err, client, done){
    if(err){
      return console.log('erro fetcghing client from poll', err);
    }
    var docenteId = null;
    client.query(inserEstudiante,[req.body.nombre,req.body.apellido, req.body.tipodoc, req.body.numdoc, req.body.codigo]
      ,function(err, result){
        if(err){
          return console.log('Error Run Query', err);
        }
        done();
        console.log(result);
    });
  });
});

var sqlAsignaturaId = "SELECT nextval('asignaturas_cdasignatura_seq')";
var sqlListaId = "SELECT nextval('lista_asignaturas_cdlista_seq')";
var inserAsignatura = "INSERT INTO public.asignaturas(cdasignatura,dsnombre) VALUES ($1, $2);";
var inserLista = "INSERT INTO public.lista_asignaturas(cdlista, cdasignatura, cddocente, nmcupo) VALUES ($1, $2, $3, $4);"
var inserClass = "INSERT INTO public.lista_estudiantes( cdlista, cdestudiante) VALUES ";
app.post('/asignatura', function (req, res, next) {
  inserClass = "INSERT INTO public.lista_estudiantes( cdlista, cdestudiante) VALUES ";
  console.log(req.body);
  pg.connect(config, function(err, client, done){
  	if(err){
  		return console.log('erro fetcghing client from poll', err);
  	}
    var docenteId = null;
    var listaId = null;
  	client.query(sqlAsignaturaId,function(err, result){
        if(err){
          return console.log('Error Run Query', err);
        }
        done();
        if(result.rows.length > 0){
          docenteId = result.rows[0].nextval;
          client.query(inserAsignatura,[docenteId,req.body.nombre]
            ,function(err, result){
              if(err){
                return console.log('Error Run Query ', err);
              }

            done();
            client.query(sqlListaId ,function(err, result){
              if(err){
                return console.log('Error Run Query asignatura', err);
              }

              done();
              if(result.rows.length > 0){
                listaId = result.rows[0].nextval;

                client.query(inserLista,[listaId,docenteId,req.body.docente,req.body.cupo]
                ,function(err, result){
                  if(err){
                    return console.log('Error Run Query Lista ', err);
                  }
                  done();
                });

                if(req.body.lsEstudiantes.length > 0){
                  req.body.lsEstudiantes.forEach(e => {
                      inserClass = inserClass + "(" + listaId +","+ e + "),";
                  });
                  
                  inserClass = inserClass.substring(0 , inserClass.length -1) + ";";
                  console.log(inserClass);
                  client.query(inserClass, function(err, result){
                    if(err){
                      return console.log('Error Run Query Lista-Estudiantes ', err);
                    }
                    done();
                  });
                }
              }
            });
          });
        }
    });
  });
});

var getListDocentes = "SELECT  * FROM public.docentes;";
app.get('/docente', function (req, res, next) {
  pg.connect(config, function(err, client, done){
    if(err){
      return console.log('erro fetcghing client from poll', err);
    }
    client.query(getListDocentes,function(err, result){
        if(err){
          return console.log('Error Run Query', err);
        }
        done();
        console.log(result);
        res.send(JSON.stringify(result.rows));
    });
  });
});

var getListEstudiante = "SELECT  * FROM public.estudiantes;";
app.get('/estudiante', function (req, res, next) {
  pg.connect(config, function(err, client, done){
    if(err){
      return console.log('erro fetcghing client from poll', err);
    }
    client.query(getListEstudiante,function(err, result){
        if(err){
          return console.log('Error Run Query', err);
        }
        done();
        console.log(result);
        res.send(JSON.stringify(result.rows));
    });
  });
});

var getListAsignaturaxDocente = "SELECT  * FROM public.lista_asignaturas l INNER JOIN public.asignaturas a ON l.cdasignatura = a.cdasignatura WHERE cddocente = $1;";
app.get('/asignatura/:cddocente', function (req, res, next) {
  
  pg.connect(config, function(err, client, done){
    if(err){
      return console.log('erro fetcghing client from poll', err);
    }
    client.query(getListAsignaturaxDocente,[req.params.cddocente],function(err, result){
        if(err){
          return console.log('Error Run Query', err);
        }
        done();
        console.log(result);
        res.send(JSON.stringify(result.rows));
    });
  });
});

var getListAsignaturaAbiertas = "SELECT  * FROM public.lista_asignaturas l INNER JOIN public.asignaturas a ON l.cdasignatura = a.cdasignatura" 
  +" INNER JOIN public.aperturas ap ON l.cdlista = ap.cdlista  WHERE fecierre IS NULL";
  app.get('/abiertas', function (req, res, next) {
  pg.connect(config, function(err, client, done){
    
    if(err){
      return console.log('erro fetcghing client from poll', err);
    }
    client.query(getListAsignaturaAbiertas,function(err, result){
        if(err){
          return console.log('Error Run Query', err);
        }
        done();
        console.log(result.rows);
        res.send(JSON.stringify(result.rows));
    });
  });
});
  var getCdListaEstudiante = "SELECT *FROM estudiantes e "
    +"INNER JOIN lista_estudiantes le ON e.cdestudiante = le.cdestudiante "
    +"INNER JOIN aperturas a ON a.cdlista = le.cdlista "
    +"WHERE e.dsnumero_documento = $1 AND e.dscodigo= $2 and a.cdapertura = $3";
  app.post('/listaestudiante', function (req, res, next) {
  pg.connect(config, function(err, client, done){
    
    if(err){
      return console.log('erro fetcghing client from poll', err);
    }

    client.query(getCdListaEstudiante,[req.body.numdoc,req.body.codigo,req.body.cdapertura],function(err, result){
        if(err){
          return console.log('Error Run Query', err);
        }
        done();
        console.log(result.rows);
        res.send(JSON.stringify(result.rows));
    });
  });
});

var getEstado = "SELECT * FROM public.aperturas WHERE cdlista = $1 AND fecierre IS NULL;";
app.get('/apertura/:cdlista', function (req, res, next) {
  pg.connect(config, function(err, client, done){
    if(err){
      return console.log('erro fetcghing client from poll', err);
    }
    client.query(getEstado,[req.params.cdlista],function(err, result){
        if(err){
          return console.log('Error Run Query', err);
        }
        done();
        console.log(result);
        res.send(result.rows.length > 0 ? false : true);
    });
   }); 
});

var inserApertura = "INSERT INTO public.aperturas(cdlista,feapertura, fecierre) VALUES ($1, $2, $3);";
app.post('/apertura', function (req, res, next) {
    console.log(req.body.cdlista);
    pg.connect(config, function(err, client, done){
      if(err){
        return console.log('erro fetcghing client from poll', err);
      }
      client.query(inserApertura,[req.body.cdlista,new Date(),null],function(err, result){
        if(err){
          return console.log('Error Run Query', err);
        }
        done();
        console.log(result);
        res.send(JSON.stringify(result.rows));
      });
    });
  });

var inserAsistencia = "INSERT INTO public.asistencias(cdlista_estudiante, cdapertra, feingreso) VALUES ($1, $2, NOW());";
app.post('/asistencia', function (req, res, next) {
    console.log("init");
    console.log(req.body);
    pg.connect(config, function(err, client, done){
      if(err){
        return console.log('erro fetcghing client from poll', err);
      }
      client.query(inserAsistencia,[req.body.cdlista_estudiante,req.body.cdapertura],function(err, result){
        if(err){
          return console.log('Error Run Query', err);
        }
        done();
        console.log(result);
        res.send(JSON.stringify(result.rows));
      });
    });
  });

var updateApertura = "UPDATE public.aperturas SET  fecierre =  NOW() WHERE cdlista = $1 AND fecierre IS NULL;";
app.put('/apertura', function (req, res, next) {
    console.log(req.body.cdlista);
    pg.connect(config, function(err, client, done){
      if(err){
        return console.log('erro fetcghing client from poll', err);
      }
      client.query(updateApertura,[req.body.cdlista],function(err, result){
        if(err){
          return console.log('Error Run Query', err);
        }
        done();
        console.log(result);
        res.send(JSON.stringify(result.rows));
      });
    });
});  




app.listen(1111, function () {
  console.log('Example app listening on port 1111!');
});