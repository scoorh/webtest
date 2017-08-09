"use strict"


//_m_load_obj('http://localhost:8000/resource/blender/untitled.obj');

function _m_load_obj(url) {
    _loadResource(url, null, null, 1)
    .then(function(o) {


        let v = [];
        let n = [];
        let tc = [];

        let uv = [];
        let un = [];
        let utc = [];
        let hia = [];
        let ia = [];
        let idx = 0;


        let lines = o.split('\n');
        for(let i = 0; i < lines.length; i++) {

            let line = lines[i].trim();
            let e = line.split(/\s+/);
            e.shift();

            if(/^v\s/.test(line)) {
                v.push.apply(v, e);
            } else if(/^vn\s/.test(line)) {
                n.push.apply(n, e);
            } else if(/^vt\s/.test(line)) {
                tc.push.apply(tc, e);
            } else if(/^f\s/.test(line)) {


                for(let j = 0; j < e.length; ++j) {

                    if(e[j] in hia) {
                        ia.push(hia[e[j]]);
                    }
                    else {
                        let vrt = e[j].split('/');

                        uv.push(+v[(vrt[0]-1)*3+0]);
                        uv.push(+v[(vrt[0]-1)*3+1]);
                        uv.push(+v[(vrt[0]-1)*3+2]);

                        if(tc.length) {
                            utc.push(+tc[(vrt[1]-1)*2+0]);
                            utc.push(+tc[(vrt[1]-1)*2+1]);
                        }

                        un.push(+v[(vrt[2]-1)*3+0]);
                        un.push(+v[(vrt[2]-1)*3+1]);
                        un.push(+v[(vrt[2]-1)*3+2]);

                        hia[e[j]] = idx;
                        ia.push(idx);
                        idx+=1;
                    }

                }
            }
        }

        console.log(ia.length);
        console.log(uv.length/3);
        console.log(utc.length/2);

        let str = '';
        for(let i = 0; i < ia.length; i++) {
            str += ia[i] + ',';
        }
        console.log(str);
        str = '';
        for(let i = 0, j = 0; i < uv.length; i+=3, j+=2) {
            str += uv[i] + ',' + uv[i+1] + ',' + uv[i+2] + ',';
            str += utc[j] + ',' + utc[j+1] + ',';
        }
        console.log(str);


    });
}




function _m_generate_log_for_geometry(g) {
    console.log(g);
    let vas = '';
    for(let i = 0; i < g.vc*(3+3+2); ++i) {
        vas += g.va[i] + ',';
    }
    //console.log(vas);

    let vvas = '';
    let k = 0;
    let d = 0;
    let ll = 0;
    for(let i = 0; i < vas.length; ++i) {
        if(vas[i] == ',') { d = 0; k = 0;}
        if(vas[i] == '.') { d = 1; k = -1;}
        if(d == 1) { k++; }

        if(k <= 5) {
            vvas += vas[i];
        }

        /*
        ll++;
        if(ll >= 600 && vas[i] == ',') {
            vvas += '\n';
            ll = 0;
        }
        */
    }
    console.log(vvas);


    let ias = '';
    for(let i = 0; i < g.ic; ++i) {
        ias += g.ia[i] + ',';
    }
    console.log(ias);
    /*
    let iias = '';
    ll = 0;
    for(let i = 0; i < ias.length; ++i) {
        iias += ias[i];

        ll++;
        if(ll >= 600 && ias[i] == ',') {
            iias += '\n';
            ll = 0;
        }
    }
    console.log(iias);
    */
}






function _m_generate_2d_quad() {

    let vt = [
        -1, -1, 0, 0 ,0,
        -1, 1, 0, 0, 1,
        1, 1, 0, 1, 1,
        1, -1, 0, 1, 0
    ];

    let va = new Float32Array(vt);

    let o = {};
    o.va = va;
    o.vc = 4;
    o.ia = null;
    o.ic = 0;
    return o;
}


function _m_generate_octahedron(d) {
    if(d > 6) d = 6;
    let r = 1 << d;


    let vc = (r+1)*(r+1) * 4 - (r*2 - 1) * 3;
    let ic = (1 << (d*2 + 3)) * 3;

    let va = new Float32Array(vc * 8);
    let ia = new Uint16Array(ic);

    __p();
    __n();
    __tc();
    __t();


    let o = {};
    o.va = va;
    o.vc = vc;
    o.ia = ia;
    o.ic = ic;
    return o;


    function __p() {
        let v = 0;
        let vb = 0;
        let t = 0;

        let vbs = 0;

        let fx, fy, fz;
        let tx, ty, tz;
        let p;

        let i;

        let dir = [
            -1, 0, 0,
            0, 0, -1,
            1, 0, 0,
            0, 0, 1
        ];

        for(i = 0; i < 4; ++i) {
            va[vbs] = 0; va[vbs+1] = -1; va[vbs+2] = 0;
            vbs+=8; ++v;
        }

        __divide(-1);
        __divide(1);

        for(i = 0; i < 4; ++i) {
            ia[t++] = vb; ia[t++] = v; ia[t++] = ++vb;
            va[vbs] = 0; va[vbs+1] = 1; va[vbs+2] = 0;
            vbs+=8; ++v;
        }

        function __divide(dv) {
            i = (dv==1) ? r-1 : 1;
            while(1) {
                if(dv==1 && 1>i) { break; }
                else if(i>r) { break; }

                p = i / r;
                va[vbs] = tx = 0;
                va[vbs+1] = ty = (-1 * dv) * p + dv;
                va[vbs+2] = tz = p;
                vbs+=8; ++v;

                for(let dd = 0, ddi = 0; dd < 4; ++dd, ddi+=3) {
                    fx = tx; fy = ty; fz = tz;
                    tx = dir[ddi] * p;
                    ty = (dir[ddi+1] - dv) * p + dv;
                    tz = dir[ddi+2] * p;

                    __make_tris(v, vb, dv)
                    __line();

                    vb += (dv==1) ? (i+1) : ((i>1) ? (i-1) : 1);
                }

                vb = v-1 - i*4;

                i -= dv;
            }
        }

        function __make_tris(tvt, tvb, dv) {
            if(dv == 1) {
                ia[t++] = tvb; ia[t++] = tvt-1; ia[t++] = ++tvb;
                for(let j = 1; j <= i; ++j) {
                    ia[t++] = tvt-1; ia[t++] = tvt; ia[t++] = tvb;
                    ia[t++] = tvb; ia[t++] = tvt++; ia[t++] = ++tvb;
                }
            }
            else {
                for(let j = 1; j < i; ++j) {
                    ia[t++] = tvb; ia[t++] = tvt-1; ia[t++] = tvt;
                    ia[t++] = tvb++; ia[t++] = tvt++; ia[t++] = tvb;
                }
                ia[t++] = tvb; ia[t++] = tvt-1; ia[t++] = tvt;
            }
        }

        function __line() {
            for(let j = 1; j <= i; ++j) {
                let pp = j/i;
                va[vbs] = (tx - fx) * pp + fx;
                va[vbs+1] = (ty - fy) * pp + fy;
                va[vbs+2] = (tz - fz) * pp + fz;
                vbs+=8; ++v;
            }
        }
    }


    function __n() {
        let t = [];
        for(let i = 0; i < va.length; i+=8) {
            t[0] = va[i]; t[1] = va[i+1]; t[2] = va[i+2];
            _m_v3_normalize(t);
            va[i] = t[0]; va[i+1] = t[1]; va[i+2] = t[2];
        }
    }


    function __tc() {
        let px = 1;
        let x, u;

        for(let i = 0; i < va.length; i+=8) {
            x = va[i];
            if(x == px) { va[i-2] = 1; }
            px = x;

            u = Math.atan2(x, va[i+2]) / (-2 * Math.PI);
            if(u < 0) u += 1;

            va[i+6] = u;
            va[i+7] = Math.asin(va[i+1]) / Math.PI + 0.5;
        }

        va[va.length-26] = va[6] = 0.125;
        va[va.length-18] = va[14] = 0.375;
        va[va.length-10] = va[22] = 0.625;
        va[va.length-2] = va[30] = 0.875;
    }


    function __t() {
        let t = [0,0,0];
        for(let i = 0; i < va.length; i+=8) {
            t[0] = va[i]; t[2] = va[i+2];
            _m_v3_normalize(t);
            va[i+3] = -t[2]; va[i+4] = 0; va[i+5] = t[0];
        }

        t[0] = -1; t[1] = 0; t[2] = -1;
        _m_v3_normalize(t);
        va[va.length-29] = t[0];
        va[va.length-28] = t[1];
        va[va.length-27] = t[2];

        t[0] = 1; t[1] = 0; t[2] = -1;
        _m_v3_normalize(t);
        va[va.length-21] = t[0];
        va[va.length-20] = t[1];
        va[va.length-19] = t[2];

        t[0] = 1; t[1] = 0; t[2] = 1;
        _m_v3_normalize(t);
        va[va.length-13] = t[0];
        va[va.length-12] = t[1];
        va[va.length-11] = t[2];

        t[0] = -1; t[1] = 0; t[2] = 1;
        _m_v3_normalize(t);
        va[va.length-5] = t[0];
        va[va.length-4] = t[1];
        va[va.length-3] = t[2];
    }

}
