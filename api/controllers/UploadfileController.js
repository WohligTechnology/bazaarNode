module.exports = {
    upload: function(req, res) {
        res.connection.setTimeout(20000000);
        req.connection.setTimeout(20000000);
        req.file("file").upload(function(err, uploadedFiles) {
            if (err) return res.send(500, err);
            _.each(uploadedFiles, function(n) {
                var oldpath = n.fd;
                var source = sails.fs.createReadStream(n.fd);
                n.fd = n.fd.split('\\').pop().split('/').pop();
                var dest = sails.fs.createWriteStream('./tbimg/' + n.fd);
                source.pipe(dest);
                source.on('end', function() {
                    sails.fs.unlink(oldpath, function(data) {
                        console.log(data);
                    });
                });
                source.on('error', function(err) {
                    console.log(err);
                });
            });
            return res.json({
                message: uploadedFiles.length + ' file(s) uploaded successfully!',
                files: uploadedFiles
            });
        });
    },
    resize: function(req, res) {
        function showimage(path) {
            var image = sails.fs.readFileSync(path);
            var mimetype = sails.mime.lookup(path);
            res.set('Content-Type', mimetype);
            res.send(image);
        }

        function checknewfile(newfilepath, width, height) {
            width = parseInt(width);
            height = parseInt(height);
            newfilenamearr = newfilepath.split(".");
            extension = newfilenamearr.pop();
            var indexno = newfilepath.search("." + extension);
            var newfilestart = newfilepath.substr(0, indexno);
            var newfileend = newfilepath.substr(indexno, newfilepath.length);
            var newfilename = newfilestart + "_" + width + "_" + height + newfileend;
            var isfile2 = sails.fs.existsSync(newfilename);
            if (!isfile2) {
                console.log("in if");
                sails.lwip.open(newfilepath, function(err, image) {
                    var dimensions = {};
                    dimensions.width = image.width();
                    dimensions.height = image.height();
                    if (width == 0) {
                        width = dimensions.width / dimensions.height * height;
                    }
                    if (height == 0) {
                        height = dimensions.height / dimensions.width * width;
                    }
                    image.resize(width, height, "lanczos", function(err, image) {
                        image.toBuffer(extension, function(err, buffer) {
                            sails.fs.writeFileSync(newfilename, buffer);
                            showimage(newfilename);
                        });
                    });
                });
            } else {
                console.log("in else");
                showimage(newfilename);
            }
        }

        var file = req.query.file;
        var filepath = './tbimg/' + file;
        var newheight = req.query.height;
        var newwidth = req.query.width;
        var isfile = sails.fs.existsSync(filepath);
        if (isfile == false) {
            var path = './tbimg/noimage.jpg';
            var split = path.substr(path.length - 3);
            var image = sails.fs.readFileSync(path);
            var mimetype = sails.mime.lookup(split);
            res.set('Content-Type', mimetype);
            res.send(image);
        } else {
            if (!newwidth && !newheight) {
                showimage(filepath);
            } else if (!newwidth && newheight) {
                newheight = parseInt(newheight);
                checknewfile(filepath, 0, newheight);
            } else if (newwidth && !newheight) {
                newwidth = parseInt(newwidth);
                checknewfile(filepath, newwidth, 0);
            } else {
                checknewfile(filepath, newwidth, newheight);
            }
        }
    }
};
