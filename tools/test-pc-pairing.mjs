// Synthetic subprocesses only: no OS pairing, discovery or radio calls.
import assert from 'node:assert/strict';
import {EventEmitter} from 'node:events';
import {PassThrough} from 'node:stream';
import {sanitizePairing,supervisePairing} from './pc-pairing.mjs';
const good={checkpoint:'R163',status:'PairingApiSucceeded',authenticationRequests:1,nativeResult:0,
  handlesClosed:true,bluetoothOperationRequested:true,watchCommandRequested:false};
const encode=value=>'PAIRING_REQUESTED\n'+JSON.stringify(value);
assert.deepEqual(sanitizePairing(encode(good)),good);
for(const patch of [{raw:'SECRET'},{status:'SECRET'},{authenticationRequests:2},{nativeResult:-1},{watchCommandRequested:true}])
  assert.throws(()=>sanitizePairing(encode({...good,...patch})));
assert.throws(()=>sanitizePairing(JSON.stringify(good)));
for(const scenario of ['success','cached','bad-report','hang','cancel','unkillable']){
  const fake=(exe,args,options)=>{
    assert.deepEqual(args,['pair-reviewed-r163']);assert.equal(options.shell,false);assert.equal(options.windowsHide,true);
    const child=new EventEmitter();child.stdout=new PassThrough();child.stderr=new PassThrough();child.stdin=new PassThrough();
    let input='';child.stdin.on('data',b=>input+=b);
    child.kill=()=>{if(scenario==='unkillable')return false;queueMicrotask(()=>child.emit('close',null));return true;};
    child.stdin.on('finish',()=>{
      assert.equal(input,'AABBCCDDEE01\n');
      queueMicrotask(()=>{
        child.stderr.write('SECRET');
        if(['hang','unkillable'].includes(scenario))return;
        if(scenario==='cancel'){process.emit('SIGINT');return;}
        const cached={...good,status:'AlreadyAuthenticatedCached',authenticationRequests:0,nativeResult:null,bluetoothOperationRequested:false};
        child.stdout.write(scenario==='cached'?JSON.stringify(cached):scenario==='bad-report'?'SECRET':encode(good));
        child.emit('close',scenario==='cached'?1:0);
      });
    });return child;
  };
  const report=await supervisePairing('FAKE-NO-EXECUTABLE','AABBCCDDEE01',{spawnWorker:fake,deadlineMs:20,fallbackMs:20});
  assert.equal(report.workerExitConfirmed,scenario!=='unkillable');
  assert.equal(report.watchCommandRequested,false);assert.equal(report.bondCurrentlyUsableVerified,false);
  assert(!JSON.stringify(report).includes('SECRET'));assert(!JSON.stringify(report).includes('AABBCCDDEE01'));
  if(scenario==='success')assert.equal(report.status,'PairingApiSucceeded');
  else if(scenario==='cached'){assert.equal(report.status,'AlreadyAuthenticatedCached');assert.equal(report.bluetoothOperationRequested,false);}
  else assert.equal(report.supervisor,scenario==='cancel'?'Cancelled':scenario==='bad-report'?'ReportRefused':'Deadline');
}
assert.equal(process.listenerCount('SIGINT'),0);
console.log(JSON.stringify({checkpoint:'R163',supervisorTestsPassed:true,scenarios:6,nativeCalls:0}));
